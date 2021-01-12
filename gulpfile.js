
// ----------------------------------------------------------------------------------
                                                                                  
// 88b           d88                        88               88                         
// 888b         d888                        88               88                         
// 88`8b       d8'88                        88               88                         
// 88 `8b     d8' 88   ,adPPYba,    ,adPPYb,88  88       88  88   ,adPPYba,  ,adPPYba,  
// 88  `8b   d8'  88  a8"     "8a  a8"    `Y88  88       88  88  a8P_____88  I8[    ""  
// 88   `8b d8'   88  8b       d8  8b       88  88       88  88  8PP"""""""   `"Y8ba,   
// 88    `888'    88  "8a,   ,a8"  "8a,   ,d88  "8a,   ,a88  88  "8b,   ,aa  aa    ]8I  
// 88     `8'     88   `"YbbdP"'    `"8bbdP"Y8   `"YbbdP'Y8  88   `"Ybbd8"'  `"YbbdP"'  
                                                                                     
                                                                                     

// Node
var fs = require('fs');
var path = require('path');
var del = require('del');
var argv = require('yargs').argv;
var directoryExists = require('directory-exists');


// Gulp
var gulp = require('gulp');


// General
var rename = require('gulp-rename');
var gulpif = require('gulp-if');
var tap = require('gulp-tap');
var merge = require('merge-stream');
var newer = require('gulp-newer');


// Templating
var nunjucks = require('gulp-nunjucks');
var nunjucksModule = require('nunjucks');
var fm = require('front-matter');
var frontMatter = require('gulp-front-matter');
var htmlmin = require('gulp-htmlmin');


// Style/scripts
var postcss = require('gulp-postcss');
var tailwind = require('tailwindcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');



// Server
var browserSync = require('browser-sync');
var browserSyncLocal = browserSync.create();
var browserSyncDist = browserSync.create();



// ----------------------------------------------------------------------------------
                                                                                               
// 8b           d8                        88              88           88                         
// `8b         d8'                        ""              88           88                         
//  `8b       d8'                                         88           88                         
//   `8b     d8'  ,adPPYYba,  8b,dPPYba,  88  ,adPPYYba,  88,dPPYba,   88   ,adPPYba,  ,adPPYba,  
//    `8b   d8'   ""     `Y8  88P'   "Y8  88  ""     `Y8  88P'    "8a  88  a8P_____88  I8[    ""  
//     `8b d8'    ,adPPPPP88  88          88  ,adPPPPP88  88       d8  88  8PP"""""""   `"Y8ba,   
//      `888'     88,    ,88  88          88  88,    ,88  88b,   ,a8"  88  "8b,   ,aa  aa    ]8I  
//       `8'      `"8bbdP"Y8  88          88  `"8bbdP"Y8  8Y"Ybbd8"'   88   `"Ybbd8"'  `"YbbdP"'  



var settings = {
    addSourceMaps: true
}

var paths = {

    root: '',
    relativeRoot: '',
    pathFromRoot: '',


    local: '__local',
    dist: '__dist',
    pipeAssetsToCms: [
        { path: '../UmbracoPractitioners.Web/', folderMustExist: true }
    ],


    settings: '__settings',
    generated: 'generated', // under settings folder
    globalJSON: 'global.json',
    navJSON: 'nav.json',
    navFullJSON: 'nav.full.json',
    navFlatJSON: 'nav.flat.json',


    templates: 'templates',
    ignore: ['__layouts', '__includes'],


    watchGlobalNunjucks: ['__layouts', '__includes'],


    files: 'assets/files',
    absoluteFiles: [
        //{ src: 'favicon.ico', dest: '' }
    ],

    styles: 'assets/styles',
    images: 'assets/images',
    media: 'assets/media',
    scripts: 'assets/scripts',
    scriptsHead: 'assets/scripts/__head',
    scriptsHeadFiles: [],
    scriptsHeadFile: '__head.min.js', 
    scriptsBody: 'assets/scripts/__body',
    scriptsBodyFiles: [],
    scriptsBodyFile: '__body.min.js', 

}


// postcss
var postcssPluginsCss = [
    tailwind(),
    autoprefixer(autoprefixSettings),
    cssnano(cssnanoSettings)
]

var cssnanoSettings = {
	discardUnused: {
		fontFace: false,
		keyframes: false
	},
	safe: true
};


// path back to the root directory
paths.root = path.join(__dirname, paths.templates);


// navigation variables
var navigation;
var flatNavigation;


// Nunjucks environment variables
var nunjucksLoader = new nunjucksModule.FileSystemLoader(paths.templates, {noCache: true});
var nunjucksEnv = new nunjucksModule.Environment(nunjucksLoader, {autoescape: false});


// prefix head/body scripts with path
if (paths.scriptsHeadFiles.length > 0) {
    for (var i=0; i<paths.scriptsHeadFiles.length; i++) {
        paths.scriptsHeadFiles[i] = paths.scriptsHead + '/' + paths.scriptsHeadFiles[i];
    }
}
if (paths.scriptsBodyFiles.length > 0) {
    for (var i=0; i<paths.scriptsBodyFiles.length; i++) {
        paths.scriptsBodyFiles[i] = paths.scriptsBody.scriptsBodyFiles[i];
    }
}


// all local YAML data in JSON
var allLocalJSON = dirTree(paths.templates);


// browsersync settings for LOCAL

var serverSettingsLocal = {
    host: 'localhost',
    port: 8888,
    ui: {
        port: 9999,
        weinre: {
            port: 8899
        }
    },
    server: {
        baseDir: paths.local
    },
    ghostMode: true,
    online: false,
    watchOptions: {
        debounceDelay: 500
    }
};

// browsersync settings for DIST

var serverSettingsDist = {
    host: 'localhost',
    port: 3000,
    ui: {
        port: 3001,
        weinre: {
            port: 3080
        }
    },
    server: {
        baseDir: paths.dist
    },
    ghostMode: false,
    online: false,
    watchOptions: {
        debounceDelay: 500
    }
};

// autoprefix settings

var autoprefixSettings = {
    brosers: ['> 0%', 'ie >= 7'],
    remove: false
};

// pipe to CMS
var doPipeAssetsToCms = (typeof paths.pipeAssetsToCms !== 'undefined' && paths.pipeAssetsToCms.length > 0 && argv.cms)

function pipeStreamToCms (stream, suffix) {
    for (var i=0; i < paths.pipeAssetsToCms.length; i++) {
        stream.pipe(gulp.dest(paths.pipeAssetsToCms[i].path + '/' + suffix));
    }
    return stream;
}



// ----------------------------------------------------------------------------------
                                                                                                 
// 88888888888                                             88                                       
// 88                                               ,d     ""                                       
// 88                                               88                                              
// 88aaaaa  88       88  8b,dPPYba,    ,adPPYba,  MM88MMM  88   ,adPPYba,   8b,dPPYba,   ,adPPYba,  
// 88"""""  88       88  88P'   `"8a  a8"     ""    88     88  a8"     "8a  88P'   `"8a  I8[    ""  
// 88       88       88  88       88  8b            88     88  8b       d8  88       88   `"Y8ba,   
// 88       "8a,   ,a88  88       88  "8a,   ,aa    88,    88  "8a,   ,a8"  88       88  aa    ]8I  
// 88        `"YbbdP'Y8  88       88   `"Ybbd8"'    "Y888  88   `"YbbdP"'   88       88  `"YbbdP"'  



function logError (error) {
    console.log(error.toString());
    this.emit('end');
}


function pathTap (file) {
    paths.relativeRoot = path.relative(path.dirname(file.path), paths.root).replace(/\\/g,"/");
    paths.pathFromRoot = file.path.replace(paths.root, "").replace(/\\/g,"/").replace(/\.njk/, ".html");
}


function getGlobalJSON() {
    return JSON.parse(fs.readFileSync('./' + paths.settings + '/' + paths.globalJSON, 'utf8'));
}


function dirTree(dir) {
	var stats = fs.lstatSync(dir),
	data = [];
	
	if(stats.isDirectory()) {
		var items = fs.readdirSync(dir);
		
		for(var i=0; i < items.length; i++ ) {
            var item = items[i];
            
			if((paths.ignore.indexOf(path.basename(item)) === -1) && (path.extname(item) == ".njk")) {	//If not in exlude directory list and a nunjucks file
				try {
					var content = fm(fs.readFileSync(dir + '/' + item, 'utf8')).attributes;
					if(Object.keys(content).length > 0) { //Check if YAML headers are empty
						if(!content.hasOwnProperty("url")) {
							content.url = dir.replace(paths.templates, "") + '/' + path.normalize(item).replace(/\.njk/, ".html");
						}
						data.push(content);
					}
				}
				catch(e) {
                    console.log("[dirTree] Error parsing YAML front matter: "+e);
                }
            } 
            else if(fs.lstatSync(dir + '/' + item).isDirectory()) {
                data = data.concat.apply(data, dirTree(dir + '/' + item));
			}
		}
	}
	return data;

}


// update the navigation
function updateNav() {
    var nav = JSON.parse(fs.readFileSync(paths.settings + '/' + paths.navJSON, 'utf8'));
    var pages = dirTree(paths.templates);

    var copyNodes = function (source, collection) {
        for (var c in collection) {
            var item = collection[c];

            if(item["id"] == source["id"]) {
                delete source["id"];
                for (var prop in source) {
                    if("url" in item && prop == "url") { continue; }
                    item[prop] = source[prop];
                }
            }
            else if(item["children"] !== "undefined" && typeof(item["children" == "object"])) {
                copyNodes(source, item["children"]);
            }
        }
        return;
    }

    for(var p in pages) {
        var page = pages[p];
        copyNodes(page, nav.nav);
    }

    fs.writeFileSync(paths.settings + '/' + paths.generated + '/' + paths.navFullJSON, JSON.stringify(nav, null, 4));
    return nav;
}


// generate flattened JSON for navigation
function flattenNav (treeNav, writeToFile) {
    var flatNav = [];

    function recurseNav(cur, parent) {
        var thisObj = JSON.parse(JSON.stringify(cur));
        thisObj.parent = parent;

        delete thisObj["children"];

        if(cur.hasOwnProperty("children")) {
            thisObj.children = [];
            for(var child in cur["children"]) {
                thisObj.children.push(cur["children"][child]["id"]);
                recurseNav(cur["children"][child], cur["id"]);
            }
        }

        flatNav.push(thisObj);
    }

    recurseNav(treeNav.nav[0], "rootNav");
    if(writeToFile) { fs.writeFileSync(paths.settings + '/' + paths.generated + '/' + paths.navFlatJSON, JSON.stringify(flatNav, null, 4)); }
    return flatNav;
}


// search flat navigation JSON
function searchFlatJSON(id, flatJSON) {
    for(var i=0; i < flatJSON.length; i++) {
        if(flatJSON[i].id == id) {
            return flatJSON[i];
        }
    } 
}


// check that there are no duplicate IDs in navigation
function checkUnique (newList, exList) {
    if(typeof exList == "undefined") {
        var exList = [];
    }

    for(var i=0; i<newList.length; i++) {
        for(var j=0; j<exList.length; j++) {
            if(newList[i].id == exList[j]) {
                console.log("[checkUnique] Duplicate ID found in nav.json: " + newList[i].id);
            }
        }
        exList[exList.length] = newList[i].id;

        if(newList[i].children) {
            checkUnique(newList[i].children, exList);
        }
    }
}



// generate the navigation JSON files on disk
function generateNav() {
    console.log("[generateNav] Generating navigation");
    navigation = updateNav();
    flatNavigation = flattenNav(navigation, true);
    checkUnique(navigation.nav);
}


// gulp task to generate the navigation
gulp.task('generateNav', function(done) {
    generateNav();
    done();
})


// just read the navigation JSON from the generated files
function readNav() {
    console.log("[readNav] Reading navigation");
    try {
        navigation = JSON.parse(fs.readFileSync(paths.settings + '/' + paths.generated + '/' + paths.navFullJSON, 'utf8'));
        flatNavigation = flattenNav(navigation, false);
    }
    catch (e) {
        console.log("[readNav] Error reading navigation");
        generateNav();
    }
}




// ----------------------------------------------------------------------------------

// 888b      88                            88                           88                    
// 8888b     88                            ""                           88                    
// 88 `8b    88                                                         88                    
// 88  `8b   88  88       88  8b,dPPYba,   88  88       88   ,adPPYba,  88   ,d8   ,adPPYba,  
// 88   `8b  88  88       88  88P'   `"8a  88  88       88  a8"     ""  88 ,a8"    I8[    ""  
// 88    `8b 88  88       88  88       88  88  88       88  8b          8888[       `"Y8ba,   
// 88     `8888  "8a,   ,a88  88       88  88  "8a,   ,a88  "8a,   ,aa  88`"Yba,   aa    ]8I  
// 88      `888   `"YbbdP'Y8  88       88  88   `"YbbdP'Y8   `"Ybbd8"'  88   `Y8a  `"YbbdP"'  
//                                        ,88                                                 
//                                      888P"                                                 


gulp.task('nunjucks', function() {

    return gulp.src([paths.templates + '/**/*.njk', '!' + paths.templates + '/{' + paths.ignore.toString() + '}/*'])
        .pipe(tap(pathTap))
        .pipe(frontMatter({property: 'data'}))
        .pipe(nunjucks.compile({
            global: getGlobalJSON(),
            nav: navigation
        }, {
            env: nunjucksEnv
        }))
        .pipe(rename({extname: ".html"}))
        .on('error', logError)
        .pipe(gulp.dest(paths.local))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist)));
});

// single file

gulp.task('nunjucks:single', function() {

    return gulp.src([paths.templates + '/**/*.njk', '!' + paths.templates + '/{' + paths.ignore.toString() + '}/*'], { since: gulp.lastRun('nunjucks:single') })
        .pipe(tap(pathTap))
        .pipe(frontMatter({property: 'data'}))
        .pipe(nunjucks.compile({
            global: getGlobalJSON(),
            nav: navigation
        }, {
            env: nunjucksEnv
        }))
        .pipe(rename({extname: ".html"}))
        .on('error', logError)
        .pipe(gulp.dest(paths.local))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist)));
    
});

// filters

nunjucksEnv.addFilter("image", function(name) {
    var relativePath = (paths.relativeRoot === '') ? paths.images : paths.relativeRoot + '/' + paths.images;
    return relativePath + '/' + name;
});


nunjucksEnv.addFilter("media", function(name) {
    var relativePath = (paths.relativeRoot === '') ? paths.media : paths.relativeRoot + '/' + paths.media;
    return relativePath + '/' + name;
});

nunjucksEnv.addFilter("style", function(name) {
    var relativePath = (paths.relativeRoot === '') ? paths.styles : paths.relativeRoot + '/' + paths.styles;
    return relativePath + '/' + name;
});

nunjucksEnv.addFilter("script", function(name) {
    var relativePath = (paths.relativeRoot === '') ? paths.scripts : paths.relativeRoot + '/' + paths.scripts;
    return relativePath + '/' + name;
});

nunjucksEnv.addFilter("file", function(name) {
    var relativePath = (paths.relativeRoot === '') ? paths.files : paths.relativeRoot + '/' + paths.files;
    return relativePath + '/' + name;
});

nunjucksEnv.addFilter("link", function(name) {
    if(name) {
        var relativePath = path.relative(path.dirname(paths.pathFromRoot), name).replace(/\\/g,"/");
        return relativePath;
    } else {
        return name;
    }
});

nunjucksEnv.addFilter("linkid", function(input) {
    var thisUrl = searchFlatJSON(input, flatNavigation);
    if(typeof thisUrl != "undefined") {
        return path.relative(path.dirname(paths.pathFromRoot), thisUrl.url).replace(/\\/g,"/");
    }
    else {
        console.log("[linkid filter] ID " + input + " was not found in: " + paths.pathFromRoot);
    }
})

nunjucksEnv.addFilter("obj", function(input) {
    var result = searchFlatJSON(input, flatNavigation);
    if(typeof result != "undefined") {
        return result;
    }
    else {
        console.log("[obj filter] ID " + input + " was not found in: " + paths.pathFromRoot);
        return "#";
    }
})



gulp.task("checkYAML", function(done) {

    var originalNav = allLocalJSON;
    allLocalJSON = dirTree(paths.templates);

    if(JSON.stringify(originalNav) != JSON.stringify(allLocalJSON)) {
        console.log("[checkYAML] Updating navigation");
        navigation = updateNav();
        flatNavigation = flattenNav(navigation);
    }

    done();
})




// ----------------------------------------------------------------------------------

//  ad88888ba                       88                         
// d8"     "8b  ,d                  88                         
// Y8,          88                  88                         
// `Y8aaaaa,  MM88MMM  8b       d8  88   ,adPPYba,  ,adPPYba,  
//   `"""""8b,  88     `8b     d8'  88  a8P_____88  I8[    ""  
//         `8b  88      `8b   d8'   88  8PP"""""""   `"Y8ba,   
// Y8a     a8P  88,      `8b,d8'    88  "8b,   ,aa  aa    ]8I  
//  "Y88888P"   "Y888      Y88'     88   `"Ybbd8"'  `"YbbdP"'  
//                         d8'                                 
//                        d8'                                  



gulp.task('css', function () {

    var stream = gulp.src([paths.styles + '/**/*.css', '!' + paths.styles + '/**.*.min.css'])
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.init()))
        .pipe(rename({ suffix: '.min' }))
        .pipe(postcss(postcssPluginsCss))
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.local + '/' + paths.styles))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.styles)));
        //.pipe(gulpif(argv.dist, browserSyncDist.reload({ stream: true })));

    // pipe to CMS
    if (doPipeAssetsToCms) { 
        stream = pipeStreamToCms(stream, paths.styles); 
    }
    
    return stream;

});

// just pass already minified css through
gulp.task('css:min', function() {

    var stream = gulp.src([paths.styles + '/**/*.min.css'])
        .pipe(gulp.dest(paths.local + '/' + paths.styles))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.styles)));

    // pipe to CMS
    if (doPipeAssetsToCms) { 
        stream = pipeStreamToCms(stream, paths.styles); 
    }
    
    return stream;

});





// ----------------------------------------------------------------------------------
                                                                         
//  ad88888ba                           88                                  
// d8"     "8b                          ""                ,d                
// Y8,                                                    88                
// `Y8aaaaa,     ,adPPYba,  8b,dPPYba,  88  8b,dPPYba,  MM88MMM  ,adPPYba,  
//   `"""""8b,  a8"     ""  88P'   "Y8  88  88P'    "8a   88     I8[    ""  
//         `8b  8b          88          88  88       d8   88      `"Y8ba,   
// Y8a     a8P  "8a,   ,aa  88          88  88b,   ,a8"   88,    aa    ]8I  
//  "Y88888P"    `"Ybbd8"'  88          88  88`YbbdP"'    "Y888  `"YbbdP"'  
//                                          88                              
//                                          88                              


gulp.task('scripts:head', function(done) {
   
    if(paths.scriptsHeadFiles.length > 0) {

        var stream = gulp.src(paths.scriptsHeadFiles)
            .pipe(gulpif(settings.addSourceMaps, sourcemaps.init()))
            .pipe(concat(paths.scriptsHeadFile))
            .pipe(uglify())
            .pipe(gulpif(settings.addSourceMaps, sourcemaps.write()))
            .pipe(gulp.dest(paths.local + '/' + paths.scripts))
            .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.scripts)));

        if (doPipeAssetsToCms) { stream = pipeStreamToCms(stream, paths.scripts); }

        return stream;
    }

    done();
});

gulp.task('scripts:body', function(done) {

    if(paths.scriptsBodyFiles.length > 0) {
        var stream = gulp.src(paths.scriptsBodyFiles)
            .pipe(gulpif(settings.addSourceMaps, sourcemaps.init()))
            .pipe(concat(paths.scriptsBodyFile))
            .pipe(uglify())
            .pipe(gulpif(settings.addSourceMaps, sourcemaps.write()))
            .pipe(gulp.dest(paths.local + '/' + paths.scripts))
            .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.scripts)));

        if (doPipeAssetsToCms) { stream = pipeStreamToCms(stream, paths.scripts); }

        return stream;
    }

    done();

});

gulp.task('scripts', function() {

    var stream = gulp.src([paths.scripts + '/**/*.js', '!' + paths.scripts + '/**/*.min.js', '!' + paths.scriptsHead + '/**/*', '!' + paths.scriptsBody + '/**/*'])
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.init()))
        .pipe(uglify())
        .pipe(gulpif(settings.addSourceMaps, sourcemaps.write({ includeContent: true})))
        .pipe(gulp.dest(paths.local + '/' + paths.scripts))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.scripts)));

    if (doPipeAssetsToCms) { stream = pipeStreamToCms(stream, paths.scripts); }

    return stream;

});

gulp.task('scripts:min', function() {

    var stream = gulp.src([paths.scripts + '/**/*.min.js', '!' + paths.scripts + '/**/*.js', '!' + paths.scriptsHead + '/**/*', '!' + paths.scriptsBody + '/**/*'])
        .pipe(gulp.dest(paths.local + '/' + paths.scripts))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.scripts)));

    if (doPipeAssetsToCms) { stream = pipeStreamToCms(stream, paths.scripts); }

    return stream;

});



// ----------------------------------------------------------------------------------

// 88                                                                      
// 88                                                                      
// 88                                                                      
// 88  88,dPYba,,adPYba,   ,adPPYYba,   ,adPPYb,d8   ,adPPYba,  ,adPPYba,  
// 88  88P'   "88"    "8a  ""     `Y8  a8"    `Y88  a8P_____88  I8[    ""  
// 88  88      88      88  ,adPPPPP88  8b       88  8PP"""""""   `"Y8ba,   
// 88  88      88      88  88,    ,88  "8a,   ,d88  "8b,   ,aa  aa    ]8I  
// 88  88      88      88  `"8bbdP"Y8   `"YbbdP"Y8   `"Ybbd8"'  `"YbbdP"'  
//                                      aa,    ,88                         
//                                       "Y8bbdP"                          



gulp.task('images', function() {

    var stream = gulp.src([paths.images + '/**/*'])
        .pipe(gulp.dest(paths.local + '/' + paths.images))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.images)));

    if (doPipeAssetsToCms) { stream = pipeStreamToCms(stream, paths.images); }

    return stream;
    
});



// ----------------------------------------------------------------------------------
                                                            
// 88b           d88                       88  88              
// 888b         d888                       88  ""              
// 88`8b       d8'88                       88                  
// 88 `8b     d8' 88   ,adPPYba,   ,adPPYb,88  88  ,adPPYYba,  
// 88  `8b   d8'  88  a8P_____88  a8"    `Y88  88  ""     `Y8  
// 88   `8b d8'   88  8PP"""""""  8b       88  88  ,adPPPPP88  
// 88    `888'    88  "8b,   ,aa  "8a,   ,d88  88  88,    ,88  
// 88     `8'     88   `"Ybbd8"'   `"8bbdP"Y8  88  `"8bbdP"Y8  
                                                            
                                                            

gulp.task('media', function() {

    var stream = gulp.src([paths.media + '/**/*'])
        .pipe(gulp.dest(paths.local + '/' + paths.media))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.media)));

    if (doPipeAssetsToCms) { stream = pipeStreamToCms(stream, paths.media); }

    return stream;
    
});




// ----------------------------------------------------------------------------------

// 88888888888  88  88                         
// 88           ""  88                         
// 88               88                         
// 88aaaaa      88  88   ,adPPYba,  ,adPPYba,  
// 88"""""      88  88  a8P_____88  I8[    ""  
// 88           88  88  8PP"""""""   `"Y8ba,   
// 88           88  88  "8b,   ,aa  aa    ]8I  
// 88           88  88   `"Ybbd8"'  `"YbbdP"'  
                                            
                                            

gulp.task('files', function() {

    var stream = gulp.src([paths.files + '/**/*'])
        .pipe(gulp.dest(paths.local + '/' + paths.files))
        .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.files)));

    if (doPipeAssetsToCms) { stream = pipeStreamToCms(stream, paths.files); }

    return stream;
    
});


gulp.task('files:absolute', function(done) { 

    var copyStream = merge();
    if(paths.absoluteFiles.length > 0) {

        for (var i=0; i<paths.absoluteFiles.length; i++) {
            var src = gulp.src(paths.templates + '/' + paths.absoluteFiles[i].src)
                .pipe(gulp.dest(paths.local + '/' + paths.absoluteFiles[i].dest))
                .pipe(gulpif(argv.dist, gulp.dest(paths.dist + '/' + paths.absoluteFiles[i].src)));
            copyStream.add(src);
        }

    }
    done();
    return copyStream;

});




// ----------------------------------------------------------------------------------

//   ,ad8888ba,   88                                       
//  d8"'    `"8b  88                                       
// d8'            88                                       
// 88             88   ,adPPYba,  ,adPPYYba,  8b,dPPYba,   
// 88             88  a8P_____88  ""     `Y8  88P'   `"8a  
// Y8,            88  8PP"""""""  ,adPPPPP88  88       88  
//  Y8a.    .a8P  88  "8b,   ,aa  88,    ,88  88       88  
//   `"Y8888Y"'   88   `"Ybbd8"'  `"8bbdP"Y8  88       88  
                                                       


gulp.task('clean', function (done) {
    

    // if piping assets to CMS folders, check that folders actually exist on the filesystem
    if (doPipeAssetsToCms) {
        for (var i = paths.pipeAssetsToCms.length - 1; i >= 0; --i) {
            if(paths.pipeAssetsToCms[i].folderMustExist) {
                if(!directoryExists.sync(paths.pipeAssetsToCms[i].path)) {
                    console.log('[pipeAssetsToCms] Required path ' + paths.pipeAssetsToCms[i].path + ' does not exist; removing from pipe list');
                    paths.pipeAssetsToCms.splice(i, 1);
                }
            }
        }

        // reset pipeAssetsToCms variable if none are left
        if(paths.pipeAssetsToCms.length == 0) {
            doPipeAssetsToCms = false;
        }
    }


    // clean local folder if --local variable provided
    if(argv.local) {
        generateNav();
        return del([paths.local + '/**/*']);
    }
    // clean dist and local folder if --dist variable provided
    else if(argv.dist) {
        generateNav();
        return del([paths.local + '/**/*', paths.dist + '/**/*']);
    }
    else {
        readNav();
    }


    done();
    
});





// ----------------------------------------------------------------------------------
                                                              
//  ad88888ba                                                    
// d8"     "8b                                                   
// Y8,                                                           
// `Y8aaaaa,     ,adPPYba,  8b,dPPYba,  8b       d8   ,adPPYba,  
//   `"""""8b,  a8P_____88  88P'   "Y8  `8b     d8'  a8P_____88  
//         `8b  8PP"""""""  88           `8b   d8'   8PP"""""""  
// Y8a     a8P  "8b,   ,aa  88            `8b,d8'    "8b,   ,aa  
//  "Y88888P"    `"Ybbd8"'  88              "8"       `"Ybbd8"'  
                                                              
                                                              

gulp.task('reload:local', function(done) {
        browserSyncLocal.reload(); 
        done();
});

gulp.task('reload:dist', function(done) {
    browserSyncDist.reload();
    done();
});

gulp.task('serve', function(done) {

    browserSyncLocal.init(serverSettingsLocal);
    if(argv.dist) {
        browserSyncDist.init(serverSettingsDist);
    }
    done();

});




// ----------------------------------------------------------------------------------

// I8,        8        ,8I                                88           
// `8b       d8b       d8'              ,d                88           
//  "8,     ,8"8,     ,8"               88                88           
//   Y8     8P Y8     8P  ,adPPYYba,  MM88MMM  ,adPPYba,  88,dPPYba,   
//   `8b   d8' `8b   d8'  ""     `Y8    88    a8"     ""  88P'    "8a  
//    `8a a8'   `8a a8'   ,adPPPPP88    88    8b          88       88  
//     `8a8'     `8a8'    88,    ,88    88,   "8a,   ,aa  88       88  
//      `8'       `8'     `"8bbdP"Y8    "Y888  `"Ybbd8"'  88       88  



gulp.task('watch', function() {

    // nav JSON
    gulp.watch(paths.settings + '/nav.json', gulp.series('generateNav', 'nunjucks', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local'));

    // nunjucks
    gulp.watch([paths.templates + '/**/*.njk', '!' + paths.templates + '/{' + paths.ignore.toString() + '}/*'], gulp.series('nunjucks:single', 'checkYAML', 'css', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});
    gulp.watch(paths.templates + '/{' + paths.watchGlobalNunjucks.toString() + '}/*.njk', gulp.series('nunjucks', 'css', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});

    // styles
    gulp.watch([paths.styles + '/**/*.css', '!' + paths.styles + '/**/*.min.css'], gulp.series('css', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});
    gulp.watch([paths.styles + '/**/*.min.css', '!'], gulp.series('css:min', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});

    // scripts
    gulp.watch([paths.scripts + '/**/*.js', '!' + paths.scripts + '/**/*.min.js', '!' + paths.scriptsHead + '/**/*', '!' + paths.scriptsBody], gulp.series('scripts', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});
    gulp.watch([paths.scripts + '/**/*.min.js', '!' + paths.scriptsHead + '/**/*', '!' + paths.scriptsBody], gulp.series('scripts:min', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});
    gulp.watch([paths.scriptsHead + '/**/*'], gulp.series('scripts:head', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});
    gulp.watch([paths.scriptsBody + '/**/*'], gulp.series('scripts:body', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});

    // images
    gulp.watch([paths.images + '/**/*'], gulp.series('images', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});
    
    // media
    gulp.watch([paths.media + '/**/*'], gulp.series('media', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});

    // files
    gulp.watch([paths.files + '/**/*'], gulp.series('files', argv.dist ? gulp.parallel('reload:local', 'reload:dist') : 'reload:local')).on('error', function() {});


});






// ----------------------------------------------------------------------------------
                                                                          
// 88888888ba,                   ad88                           88           
// 88      `"8b                 d8"                             88    ,d     
// 88        `8b                88                              88    88     
// 88         88   ,adPPYba,  MM88MMM  ,adPPYYba,  88       88  88  MM88MMM  
// 88         88  a8P_____88    88     ""     `Y8  88       88  88    88     
// 88         8P  8PP"""""""    88     ,adPPPPP88  88       88  88    88     
// 88      .a8P   "8b,   ,aa    88     88,    ,88  "8a,   ,a88  88    88,    
// 88888888Y"'     `"Ybbd8"'    88     `"8bbdP"Y8   `"YbbdP'Y8  88    "Y888  
                                                                          


gulp.task('default', gulp.series('clean', gulp.parallel('nunjucks', 'css:min', 'scripts:head', 'scripts:body', 'scripts', 'scripts:min', 'files', 'files:absolute', 'images', 'media'), 'css', 'serve', 'watch'));


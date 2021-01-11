# Umbraco Practitioners front-end development

Front-end development work for the Umbraco Practitioners website, using Gulp, Nunjucks and Tailwind CSS.

| Package  | Version |
| :------- | :------ |
| node     | 15.5.1  |
| npm      | 7.3.0   |
| yarn     | 1.22.10 |
| gulp-cli | 2.3.0   |
| gulp     | 4.0.2   |

## Installation
1. Clone the repository
2. Run `yarn` to install packages
3. Run `gulp`

## Gulp options

`gulp`  
Builds to existing `__local` folder (not source-controlled)

`gulp --local`  
Deletes existing `__local` folder and recreates all local files (not source-controlled)

`gulp --cms`  
Also pipes the compiled site `assets` folder (styles, scripts, images) to a separate relative location `../UmbracoPractitioners.Web/` for use in Umbraco website.

`gulp --dist`  
Builds to local `__local` AND `__dist` folders separately. `__dist` folder IS source-controlled. Not really necessary for this scenario.



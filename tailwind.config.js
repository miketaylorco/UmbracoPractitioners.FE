module.exports = {
  purge: {
    enabled: true,
    content: ['./__local/**/*.html']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      white: '#ffffff',
      grey: {
        0: '#f5f1ee',
        1: '#d2cbc7',
        2: '#666666',
        3: '#333333'
      },
      black: '#000000',
      articles: {
        0: '#e5eff9',
        1: '#0063c8',
        2: '#004994',
        3: '#003c7a'
      },
      blogs: {
        0: '#e5f1f0',
        1: '#00746c',
        2: '#005650',
        3: '#00403b'
      },
      events: {
        0: '#fef0f5',
        1: '#eb034c',
        2: '#ba023c',
        3: '#a10234'
      },
      learning: {
        0: '#f5e8f3',
        1: '#a31f8d',
        2: '#781768',
        3: '#631355'
      },
      profiles: {
        0: '#e5f2f4',
        1: '#007f97',
        2: '#006375',
        3: '#004d5c'
      },
      resources: {
        0: '#f0f0f5',
        1: '#6d72a0',
        2: '#565b85',
        3: '#424666'
      },
      showcase: {
        0: '#ebf4ee',
        1: '#037522',
        2: '#025e1b',
        3: '#024614'
      },
      practitioners: {
        0: '#e5f1f0',
        1: '#00746c',
        2: '#005650',
        3: '#00403b',
        accent: '#00aea2'
      }
    },
    fontFamily: {
      main: ['skolar-sans-latin', 'sans-serif']
    },
    extend: {}
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

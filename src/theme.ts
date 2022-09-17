export const home = (isDarkMode: boolean = false) => ({
  // Home Scene
  headerBg: isDarkMode ? '#222831' : 'white',
  borderColor: isDarkMode ? 'grey' : 'lightgrey',

  // List item vertical
  listItemBg: isDarkMode ? '#252525' : 'white',
  shadowColor: isDarkMode ? 'rgb(128, 128, 128, 0.6)' : 'grey',
  itemTextColor: isDarkMode ? 'white' : 'black',
  itemDescColor: isDarkMode ? 'whitesmoke' : 'grey',
});

export const toolbar = (isDarkMode: boolean = false) => ({
  bg: isDarkMode ? '#313a44' : 'white',
  shadow: isDarkMode ? 'rgb(128, 128, 128, 0.6)' : 'grey',
});

export const rope = (isDarkMode: boolean = false) => ({
  bg: isDarkMode ? '#1B2430' : 'white',
  blackWhite: isDarkMode ? 'white' : 'black',
});

// const fs = require('fs');

// const filePath = 'C:/Users/IDO/source/repos/Hours_Reports_Project_v1/node_modules/idb-wrapper/idbstore.js';

// fs.readFile(filePath, 'utf8', (err, data) => {
//   if (err) {
//     console.error('Error reading file:', err);
//     return;
//   }

//   if (data.includes("require('browser-env')")) {
//     console.log('browser-env is already imported in the file.');
//     return;
//   }

//   const updatedData = data.replace(
//     /require\('idb-wrapper'\)/,
//     "require('browser-env');\n$&"
//   );

//   fs.writeFile(filePath, updatedData, 'utf8', (err) => {
//     if (err) {
//       console.error('Error writing to file:', err);
//       return;
//     }
//     console.log('browser-env import added successfully.');
//   });
// });
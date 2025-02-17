const fs = require("fs");

// defined groups in directory
const groups = fs.readdirSync("tiles").filter(g => !g.endsWith(".png"));

// used to break lines
const blankPicnum = 13;

// used to draw a line after the group name
const separatorPicnum = 2834;

// 2854 = blue
// 2940 = red 
// 2966 = gray
const fontPicnum = 2854;

// corresponding to tile selection menu grid size
const gridColumNumber = 30;

const tilesCfgContent = `tilegroup "TAGGED GROUPS" {

    hotkey "T"

    tiles {
        ${groups.map(g => {
            const name = g.indexOf(".") > -1 ? g.split(".")[1] : g;
            const groupNamePicnums = name.split("").map(c => fontPicnum + c.toUpperCase().charCodeAt(0) - 65).concat(blankPicnum, ...new Array(gridColumNumber - (name.length + 2)).fill(separatorPicnum), blankPicnum);
            const files = fs.readdirSync(`tiles/${g}`);
            const tilesPicnums = files.map(f => f.split(".")[0]).sort((a,b) => a-b).concat(...new Array(gridColumNumber - (files.length % gridColumNumber)).fill(blankPicnum));
            return `
        // ${name}
        ${groupNamePicnums.join(" ")}
        ${tilesPicnums.join(" ")}
        ${new Array(gridColumNumber).fill(blankPicnum).join(" ")}
        `;
        }).join("\r")}

    }

}
`;

fs.writeFileSync("tiles.cfg", tilesCfgContent);
fs.writeFileSync("C:\\Games\\Duke Nukem 3D\\mapster\\tiles.cfg", tilesCfgContent);
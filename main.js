const fs = require("fs");

// defined groups in directory
const groups = fs.readdirSync("tiles").filter(g => !g.endsWith(".png"));

// used to break lines
const blankPicnum = 3026;

// used to draw a line after the group name
const separatorPicnum = 355;

// 2854 = blue
// 2940 = red 
// 2966 = gray
const fontPicnum = 2966;

// corresponding to tile selection menu grid size
const gridColumNumber = 30;

// smart sorting algorithm
const smartSort = (a,b) => {
    if (a.indexOf("#") > -1 && b.indexOf("#") === -1) return -1;
    if (b.indexOf("#") > -1 && a.indexOf("#") === -1) return +1;
    if (a.indexOf("#") > -1 && b.indexOf("#") > -1) {
        return a.split("#")[0] - b.split("#")[0];
    };
    return a-b;
};

const tilesCfgContent = `tilegroup "TAGGED GROUPS" {

    hotkey "T"

    tiles {

        ${groups.map(g => {

            const name = g.indexOf("#") > -1 ? g.split("#")[1] : g;
            const nameSprites = name.split("").map(c => fontPicnum + c.toUpperCase().charCodeAt(0) - 65);

            const groupNamePicnums = [
                3401,3392,
                blankPicnum,
                ...nameSprites,
                blankPicnum,
                ...new Array(gridColumNumber - (name.length + 4)).fill(1293)
            ];

            while (groupNamePicnums.length < gridColumNumber) {
                groupNamePicnums.push(separatorPicnum);
            }
            
            const tilesPicnums = [];

            const subdirs = fs.readdirSync(`tiles/${g}`).filter(f => !f.endsWith(".png"));
            for(const subdir of subdirs) {
                const subfiles = fs.readdirSync(`tiles/${g}/${subdir}`).filter(f => f.indexOf("@") === -1);
                tilesPicnums.push(
                    ...subfiles
                    .map(f => f.split(".")[0])                    
                    .sort(smartSort)
                    .map(f => f.indexOf("#") > -1 ? f.split("#")[1] : f)
                    .concat(...new Array(gridColumNumber - ((subfiles.length % gridColumNumber) || gridColumNumber))
                    .fill(blankPicnum))
                );
            }

            const files = fs.readdirSync(`tiles/${g}`).filter(f => f.endsWith(".png")).filter(f => f.indexOf("@") === -1);
            tilesPicnums.push(
                ...files
                .map(f => f.split(".")[0])
                .sort(smartSort)
                .map(f => f.indexOf("#") > -1 ? f.split("#")[1] : f)
                .concat(...new Array(gridColumNumber - ((files.length % gridColumNumber) || gridColumNumber))
                .fill(blankPicnum))
            );

            return `
        // ${name}
        ${groupNamePicnums.join(" ")}
        ${new Array(gridColumNumber).fill(blankPicnum).join(" ")}
        ${tilesPicnums.join(" ")}
        ${new Array(gridColumNumber).fill(blankPicnum).join(" ")}
        `;

        }).join("\r")}

    }

}
`;

fs.writeFileSync("tiles.cfg", tilesCfgContent);
fs.writeFileSync("C:\\Games\\Duke Nukem 3D\\mapster\\tiles.cfg", tilesCfgContent);
const fs = require("fs");

// directory where the tile folders are located
const directory = "tiles";

// picnum used to break lines
const blankPicnum = 30463;

// picnum used to draw a line after the group name
const separatorPicnum = 1293;

// 2854 = blue font
// 2940 = red font
// 2966 = gray font
const fontPicnum = 2966;

// used to determine number of tiles per row
const resolution = { width: 1920, height: 1080 };

// calculate number of tiles per row based on resolution width
const gridColumNumber = resolution.width / 64;

// smart sorting algorithm
const smartSort = (a,b) => {
    if (/z\d*#/.test(a) && !/z\d*#/.test(b)) return +1;
    if (!/z\d*#/.test(a) && /z\d*#/.test(b)) return -1;
    if (/#/.test(a) && !/#/.test(b)) return -1;
    if (!/#/.test(a) && /#/.test(b)) return +1;
    if (/#/.test(a) && /#/.test(b)) {
        return parseInt(a.split("#")[0]) - parseInt(b.split("#")[0]);
    }
    return a-b;
};

// load template tiles.cfg
const template = fs.readFileSync("template.cfg", "utf-8");

// load folder and file structure
const groups = fs.readdirSync(directory).filter(g => !g.endsWith(".png") && g.indexOf("@") === -1).sort(smartSort);

// generate full tile group
const taggedGroups = `tilegroup "TAGGED GROUPS" {

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
                ...new Array(gridColumNumber - (name.length + 4)).fill(separatorPicnum)
            ];
            
            const tilesPicnums = [];

            let beforeBreak = 0;
            const subdirs = fs.readdirSync(`tiles/${g}`).filter(f => !f.endsWith(".png") && f.indexOf("@") === -1).sort(smartSort);
            for(const subdir of subdirs) {
                const subfiles = fs.readdirSync(`tiles/${g}/${subdir}`).filter(f => f.indexOf("@") === -1);
                beforeBreak += subfiles.length;
                tilesPicnums.push(
                    ...subfiles
                    .map(f => f.split(".")[0])                    
                    .sort(smartSort)
                    .map(f => f.indexOf("#") > -1 ? f.split("#")[1] : f)
                );
                if (subdir.indexOf("$") > -1) {                    
                    tilesPicnums.push(
                         ...new Array(gridColumNumber - ((beforeBreak % gridColumNumber) || gridColumNumber)).fill(blankPicnum)
                    )
                    beforeBreak = 0;
                }
            }

            const files = fs.readdirSync(`tiles/${g}`).filter(f => f.endsWith(".png")).filter(f => f.indexOf("@") === -1);
            tilesPicnums.push(
                ...files
                .map(f => f.split(".")[0])
                .sort(smartSort)
                .map(f => f.indexOf("#") > -1 ? f.split("#")[1] : f)
                // .concat(
                //     ...new Array(gridColumNumber - ((files.length % gridColumNumber) || gridColumNumber)).fill(blankPicnum)
                // )
            );

            tilesPicnums.push(
                ...new Array(gridColumNumber - (tilesPicnums.length % gridColumNumber || gridColumNumber)).fill(blankPicnum)
            );

            return `
        // ${name}
        ${groupNamePicnums.join(" ")}
        ${new Array(gridColumNumber).fill(blankPicnum).join(" ")}
        ${tilesPicnums.join(" ")}
        ${new Array(gridColumNumber).fill(blankPicnum).join(" ")}
        `;

        }).join("")}

    }

}`;

// generate individual tile groups
const tileGroups = groups.map(g => {

    const name = g.indexOf("#") > -1 ? g.split("#")[1] : g;

    const tilesPicnums = [];

    const subdirs = fs.readdirSync(`tiles/${g}`).filter(f => !f.endsWith(".png") && f.indexOf("@") === -1).sort(smartSort);
    for(const subdir of subdirs) {
        const subfiles = fs.readdirSync(`tiles/${g}/${subdir}`).filter(f => f.indexOf("@") === -1);
        tilesPicnums.push(
            ...subfiles
            .map(f => f.split(".")[0])                    
            .sort(smartSort)
            .map(f => f.indexOf("#") > -1 ? f.split("#")[1] : f)
        );
        if (subdir.indexOf("$") > -1) {                    
            tilesPicnums.push("\n");
        }
    }

    const files = fs.readdirSync(`tiles/${g}`).filter(f => f.endsWith(".png")).filter(f => f.indexOf("@") === -1);
    tilesPicnums.push(
        ...files
        .map(f => f.split(".")[0])
        .sort(smartSort)
        .map(f => f.indexOf("#") > -1 ? f.split("#")[1] : f)
    );

    return `    
tilegroup "${name.toUpperCase()}" {
    hotkey "${name.charAt(0).toUpperCase()}"
    tiles {            
        ${tilesPicnums.join(" ").split("\n").map(t => t.trim()).join("\n\t\t")}
    }            
}    
    `;

});

// generate the final tiles.cfg content
const tilesCfgContent = template.replace("{content}", [taggedGroups/*, ...tileGroups.map(g => g.trim())*/].join("\n\n"));

// create files
fs.writeFileSync("tiles.cfg", tilesCfgContent);
fs.writeFileSync("C:\\Games\\Duke Nukem 3D\\mapster\\tiles.cfg", tilesCfgContent);
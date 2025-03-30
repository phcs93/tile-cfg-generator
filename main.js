const fs = require("fs");

// defined groups in directory
const groups = fs.readdirSync("tiles").filter(g => !g.endsWith(".png") && g.indexOf("@") === -1);

// used to break lines
//const blankPicnum = 3026;
const blankPicnum = 30463;

// used to draw a line after the group name
const separatorPicnum = 1293;
//const separatorPicnum = 1236;

// 2854 = blue
// 2940 = red 
// 2966 = gray
const fontPicnum = 2966;

// corresponding to tile selection menu grid size
const resolution = { width: 1920, height: 1080 };
const gridColumNumber = resolution.width / 64;

// smart sorting algorithm
const smartSort = (a,b) => {
    if (a.indexOf("z#") > -1 && b.indexOf("z#") === -1) return +1;
    if (b.indexOf("z#") > -1 && a.indexOf("z#") === -1) return -1;
    if (a.indexOf("#") > -1 && b.indexOf("#") === -1) return -1;
    if (b.indexOf("#") > -1 && a.indexOf("#") === -1) return +1;
    if (a.indexOf("#") > -1 && b.indexOf("#") > -1) {
        return parseInt(a.split("#")[0]) - parseInt(b.split("#")[0]);
    };
    return a-b;
};

const tilesCfgContent = `#include "names.h"

tilegroup "TAGGED GROUPS" {

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

            const subdirs = fs.readdirSync(`tiles/${g}`).filter(f => !f.endsWith(".png") && f.indexOf("@") === -1).sort(smartSort);
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

// Uncomment this group to get the [OLD_COLOR_SCHEME].
tilegroup "All"
{
    tilerange 0 30704  // MAXUSERTILES

    // NOTE: no hotkey, this group will not show up in the 'T' menu.

    // NOTE: colors specified here (as well as in the first argument to the DEF
    // commands '2dcol' and '2dcolidxrange') refer to Mapster32's editorcolor[]
    // index. They can be viewed with "do set showpal 1" assuming that a.m32
    // has been loaded.
    //
    // The actual color indices will be offset in the range [0 .. 4] when the
    // mouse hovers near them.
    //
    // For example, under the Duke3D palette, one can create a color scheme
    // similar to earlier Mapster32 builds (non-blocking sprites have an orange
    // tint, blocking ones are purple) by first putting in your m32_autoexec.cfg
    // file the lines
    //
    //  // do gamevar i 0 1  // only if a.m32 is not loaded
    //  script_expertmode 1
    //  do for i range 256 ifge i 33 { set editorcolors[i] i }
    //  script_expertmode 0
    //
    // which maps editorcolor[] indices 33 through 255 to the same actual color
    // indices, and then setting here one of the alternatives:
    colors 139 231  // reddish orange / purple
//    colors 208 64  // brighter orange / sky blue
    // This sets tile colors for all sprites excluding those which have been
    // assigned a color by the above tile group declarations.
}


// Alphabet configuration for text entry tool in 3D mode
// (press Ctrl-T on a wall-aligned letter)
// 32 alphabets max.

alphabet  // blue font
{
	maprange 33 126 STARTALPHANUM

	offseta "^" 0 2
	offseta "qQ;" 0 -1
}

alphabet
{
	maprange 33 126 MINIFONT
	maprangea "a" "z" 3104

//	offset "\\" 0 3 doesn't work
	offset 92 0 3
	offseta "qQ" 0 -1
	offseta ":" 0 1
	offseta "'\"" 0 3
}

alphabet  // red font
{
	maprangea "0" "9" 2930
	maprangea "A" "Z" BIGALPHANUM
	maprangea "a" "z" BIGALPHANUM
	mapa "-" 2929
	mapa ".,!?;:/%" 3002
	mapa "'" 3022
}

alphabet  // silver font
{
	maprangea "0" "9" 2992
	maprangea "A" "Z" 2966
	maprangea "a" "z" 2966
}

alphabet  // yellow numbers 3x5
{
	maprangea "0" "9" THREEBYFIVE
	mapa ":/" 3020
	offseta ":" 0 1
}

alphabet  // silver numbers
{
	maprangea "1" "9" W_NUMBERS
	mapa "0" 649
}

alphabet
{
	maprangea "0" "9" DIGITALNUM
}

`;

fs.writeFileSync("tiles.cfg", tilesCfgContent);
fs.writeFileSync("C:\\Games\\Duke Nukem 3D\\mapster\\tiles.cfg", tilesCfgContent);
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateReducers = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const utils_1 = require("./utils");
const lodash = require("lodash");
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function migrateReducers(_options) {
    return (tree, _context) => {
        const { filePath } = _options;
        if (!filePath) {
            throw new schematics_1.SchematicsException(`filePath option is required.`);
        }

        if(!tree.exists(filePath) && tree.getDir(filePath).subfiles.length > 0) {
            tree.getDir(filePath)
            .visit(fileName => {
            if (!fileName.endsWith('reducer.ts')) {
                return;
            }
            const content = tree.read(fileName);
            if (!content) {
                return;
            }
            let strContent = '';
            if (content)
                strContent = content.toString();
            const updatedContent = process(strContent);
            if (updatedContent) {
                console.log('Updated Reducer Content:', updatedContent);
                tree.overwrite(fileName, updatedContent);
            }
        });
        } else {
            const content = tree.read(filePath);
            if (!content) {
                return;
            }
            let strContent = '';
            if (content)
                strContent = content.toString();
            const updatedContent = process(strContent);
            if (updatedContent) {
                console.log('Updated Reducer Content:', updatedContent);
                tree.overwrite(filePath, updatedContent);
            }
        }
        return tree;
    };
}
exports.migrateReducers = migrateReducers;
function process(content) {
    let output = utils_1.Util.removeInlineComment(content);
    output = utils_1.Util.removeMultilineComment(content);
    const allCases = getCases(content);
    const allCaseReturns = getCaseReturnValues(content);
    const allLocalLogic = getLocalLogic(content);
    output = createReducer(content, allCases, allCaseReturns, allLocalLogic);
    return output;
}

function getCases(content) {
    const regex = /.(?<=case )(.*)(?=:)/g;
    const list = content.match(regex) || [];
    return list.map(x => {
        const y = x.trim().split('.');
        return lodash.camelCase(y[y.length - 1]);
    });
}

function getLocalLogic(content) {
    const regex = /(?<=case .*?:)([\s\S.]*?)(?=return)/g;
    const list = content.match(regex) || [];
    return list.map(x => x.trim());
}

function getCaseReturnValues(content) {
    const regex = /(?<=case .*?:[\s\S.]*?return\s?)([\s\S.]*?)(?=;)/gm;
    const list = content.match(regex) || [];
    return list.map(x => x.trim());
}

function createReducer(content, allCases, allCaseReturns, allLocalLogic) {
    let match;
    const re = /(export(\ )+function)/gi;
    const reAction = /action.([^ |,|}]+)/g;
    let output = utils_1.Util.removeMultilineComment(content);
    output = utils_1.Util.removeInlineComment(content);
    if ((match = re.exec(output)) != null) {
        const initPos = match.index - 1;
        const endPos = findClassEndPos(output, initPos);
        if (endPos === 0) {
            console.error('failed to parse');
            return null;
        }
        let template = `
export const myReducer = createReducer(
  initialState,
`;
        const listOn = [];
        allCases.forEach((acase, i) => {
            let caseBlock = allCaseReturns[i];
            let localLogic = allLocalLogic[i];
            const match = caseBlock.match(reAction);
            let key = 'payload';
            if (match) {
                caseBlock = caseBlock.replace(reAction, "$1");
            }

            if(localLogic && localLogic !== ''){
                const match1 = localLogic.match(reAction);
                if (match1) {
                    localLogic = localLogic.replace(reAction, "$1");
                }
                listOn.push(`
                on(${acase}, (state,  ${key }) => {
                    ${localLogic}  return ${caseBlock}})`);
            } else {
                listOn.push(`
                on(${acase}, (state,  ${key }) => (${caseBlock}))`);
            }

        });
        template += listOn.join(',');
        template += `
);

export function reducer(state: State | undefined, action: Action) {
  return myReducer(state, action);
}
`;
        output = output.substr(0, initPos) + template + output.substr(initPos + endPos);
        output = `
import { createReducer, on, Action } from '@ngrx/store';

    ` + output;
    }
    return output;
}
function findClassEndPos(str, pos) {
    var content = str.substring(pos);
    var re = /[{}]/g;
    var counter = 0;
    let match;
    while ((match = re.exec(content)) != null) {
        if (content[match.index] == '{') {
            counter++;
        }
        else {
            counter--;
        }
        if (counter < 0) {
            console.error('found incorrect paranthesis');
            break;
        }
        else if (counter == 0) {
            return match.index + 1;
        }
    }
    return 0;
}
//# sourceMappingURL=reducer.js.map

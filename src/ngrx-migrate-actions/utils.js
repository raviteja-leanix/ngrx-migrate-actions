"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
class Util {
    static removeInlineComment(content) {
        var re = /[\ \t]*\/\/.*/g;
        return content.replace(re, '');
    }
    static removeMultilineComment(content) {
        const regex = /\/\*([\s\S]*?)\*\//g;
        content = content.replace(regex, '');
        return content;
    }
}
exports.Util = Util;
//# sourceMappingURL=utils.js.map
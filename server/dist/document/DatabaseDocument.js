"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MemoryDocument_1 = __importDefault(require("./MemoryDocument"));
const DocumentModel_1 = __importDefault(require("../models/DocumentModel"));
/**
 * Database document: persistant across
 * sessions.
 */
class DatabaseDocument extends MemoryDocument_1.default {
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            // Debug.
            // console.log(`[${this.constructor.name}] Document ${this.id} is opened.`);
            const document = yield DocumentModel_1.default.findOne({ where: { id: this.id || null }, });
            if (document == null) {
                return false;
            }
            this._content = document.content;
            this._isOpen = true;
            return this;
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            const [affectedCount] = yield DocumentModel_1.default.update({ content: this._content }, { where: { id: this.id }, });
            if (affectedCount <= 1) {
                return false;
            }
            return true;
        });
    }
}
exports.default = DatabaseDocument;

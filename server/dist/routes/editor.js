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
const express_1 = require("express");
const DocumentModel_1 = __importDefault(require("../models/DocumentModel"));
let router = (0, express_1.Router)();
/**
 * Document routes
 */
// Get all documents
router.get('/documents', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const documents = yield DocumentModel_1.default.findAll({
        attributes: ['id', 'title'],
    });
    res.json({ status: 'success', data: documents, });
}));
// Create a new document.
router.post('/documents', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const documentTitle = (_a = req.body) === null || _a === void 0 ? void 0 : _a.title;
    if (documentTitle == null) {
        res.status(400).json({ status: 'fail' });
    }
    const newDocument = yield DocumentModel_1.default.create({
        title: documentTitle,
        content: '',
    });
    res.json({ status: 'success', data: newDocument.id, });
}));
// Get a document.
router.get('/documents/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var documentId = BigInt(req.params.id);
    }
    catch (error) {
        res.status(400).json({ status: 'fail' });
        return;
    }
    const document = yield DocumentModel_1.default.findOne({
        where: { id: documentId },
    });
    if (document == null) {
        res.status(400).json({ status: 'fail' });
        return;
    }
    res.json({ status: 'success', data: document });
}));
// Delete a document.
router.delete('/documents/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var documentId = BigInt(req.params.id);
    }
    catch (error) {
        res.status(400).json({ status: 'fail' });
        return;
    }
    yield DocumentModel_1.default.destroy({ where: { id: documentId } });
    res.json({ status: 'success' });
}));
module.exports = router;

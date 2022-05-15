import { Router, Request, Response } from "express";

import EditorDocument from '../models/EditorDocument';

let router: Router = Router();


/**
 * Document routes
 */

// Get all documents
router.get('/documents', async (req: Request, res: Response) => {
    const documents: EditorDocument[] = await EditorDocument.findAll();

    res.json({ status: 'success', data: documents, });
});

// Create a new document.
router.post('/documents', async (req: Request, res: Response) => {
    const documentTitle: string | null = req.body?.title;

    if (documentTitle == null) {
        res.status(400).json({ status: 'fail' });
    }

    const newDocument: EditorDocument = await EditorDocument.create({
        title: documentTitle,
    });

    res.json({ status: 'success', data: newDocument.id, });
});

// Get a document.
router.get('/documents/:id', async (req: Request, res: Response) => {
    try {
        var documentId: BigInt = BigInt(req.params.id);
    } catch (error) {
        res.status(400).json({ status: 'fail' });
        return;
    }

    const document: EditorDocument | null = await EditorDocument.findOne({ where: { id: documentId } });

    if (document == null) {
        res.status(400).json({ status: 'fail' });
        return;
    }

    res.json({ status: 'success', data: document });
});

// Delete a document.
router.delete('/documents/:id', async (req: Request, res: Response) => {
    try {
        var documentId: BigInt = BigInt(req.params.id);
    } catch (error) {
        res.status(400).json({ status: 'fail' });
        return;
    }

    await EditorDocument.destroy({ where: { id: documentId } });

    res.json({ status: 'success' });
});

module.exports = router;
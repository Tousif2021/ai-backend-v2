const express = require('express');
const supabase = require('../../lib/supabaseClient');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*');

    if (error) throw error;

    const bucketName = 'documents';

    // For each doc, create a signed URL valid for 1 hour
    const docsWithUrls = await Promise.all(documents.map(async (doc) => {
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(doc.file_path, 3600);

      if (error) {
        console.error('Error creating signed URL:', error);
        return { ...doc, url: null };
      }

      return {
        ...doc,
        url: data.signedUrl,
      };
    }));

    res.json(docsWithUrls);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;

export const checkTermsAccepted = (req, res, next) => {
    const { termsAccepted } = req.body;

    if (!termsAccepted) {
        return res.status(403).json({ error: 'You must accept the terms and conditions due to international regulations' });
    }
    next();
};

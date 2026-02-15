/**
 * Format the AI response to be HTML-safe and friendly.
 * In a real scenario, this might do more complex parsing.
 * For now, we ensure newlines become <br> or paragraphs.
 */
function formatRecipeResponse(text) {
    if (!text) return "";

    // 1. Convert Markdown bold **text** to <strong>text</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 2. Convert newlines to <br> for simple rendering
    //    But let's make it smarter: double newlines = paragraph
    formatted = formatted.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('');

    return formatted;
}

module.exports = { formatRecipeResponse };

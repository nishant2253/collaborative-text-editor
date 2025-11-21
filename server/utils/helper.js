// server/utils/helper.js
const sanitizeBasic = (input) => {
  if (input === undefined || input === null) return input;
  // Remove script tags only (leave other HTML that editors like Quill produce)
  try {
    return String(input).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  } catch (e) {
    return input;
  }
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { sanitizeBasic, asyncHandler };

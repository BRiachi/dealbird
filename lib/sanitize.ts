/**
 * Server-side HTML sanitizer — strips dangerous tags and attributes
 * to prevent stored XSS in user-generated HTML content (e.g., course lesson bodies).
 */

// Tags that are always dangerous
const DANGEROUS_TAGS = /(<\/?)(script|iframe|object|embed|form|input|textarea|select|button|link|meta|base|applet)([\s>\/])/gi;

// Event handler attributes (onclick, onerror, onload, etc.)
const EVENT_HANDLERS = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;

// javascript: and data: URLs in href/src/action attributes
const DANGEROUS_URLS = /(href|src|action|formaction|xlink:href)\s*=\s*(?:"(?:javascript|data|vbscript):[^"]*"|'(?:javascript|data|vbscript):[^']*')/gi;

// Style expressions that can execute JS (IE legacy but still good to strip)
const STYLE_EXPRESSIONS = /expression\s*\(|url\s*\(\s*(?:javascript|data):/gi;

export function sanitizeHtml(html: string): string {
    if (!html) return "";
    return html
        .replace(DANGEROUS_TAGS, "&lt;$2$3")
        .replace(EVENT_HANDLERS, "")
        .replace(DANGEROUS_URLS, "")
        .replace(STYLE_EXPRESSIONS, "");
}

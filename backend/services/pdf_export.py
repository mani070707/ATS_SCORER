import io
import logging
from html.parser import HTMLParser
from xml.sax.saxutils import escape

logger = logging.getLogger('ats_resume_scorer')


class _ReadableHTMLParser(HTMLParser):
    """Convert report HTML into readable blocks for the portable PDF renderer."""

    block_tags = {
        'address', 'article', 'aside', 'blockquote', 'br', 'div', 'footer',
        'h1', 'h2', 'h3', 'h4', 'header', 'li', 'p', 'section', 'tr',
    }

    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.ignored_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in {'style', 'script'}:
            self.ignored_depth += 1
            return
        if self.ignored_depth:
            return
        if tag in self.block_tags:
            self.parts.append('\n')
        if tag == 'li':
            self.parts.append('- ')

    def handle_endtag(self, tag: str) -> None:
        if tag in {'style', 'script'}:
            self.ignored_depth = max(0, self.ignored_depth - 1)
            return
        if self.ignored_depth:
            return
        if tag in self.block_tags:
            self.parts.append('\n')

    def handle_data(self, data: str) -> None:
        if not self.ignored_depth:
            self.parts.append(data)

    def lines(self) -> list[str]:
        text = ''.join(self.parts)
        return [' '.join(line.split()) for line in text.splitlines() if line.strip()]


def _generate_reportlab_pdf(html_docs: dict[str, str]) -> bytes:
    """Portable fallback for systems without WeasyPrint's native libraries."""
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

    output = io.BytesIO()
    document = SimpleDocTemplate(
        output,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title='ATS Resume Analysis Report',
    )
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        'ReportTitle', parent=styles['Title'], fontName='Helvetica-Bold',
        fontSize=20, leading=25, textColor=colors.HexColor('#172554'),
        alignment=TA_CENTER, spaceAfter=12,
    )
    section = ParagraphStyle(
        'SectionTitle', parent=styles['Heading2'], fontName='Helvetica-Bold',
        fontSize=14, leading=18, textColor=colors.HexColor('#3730A3'), spaceAfter=8,
    )
    body = ParagraphStyle(
        'ReportBody', parent=styles['BodyText'], fontName='Helvetica',
        fontSize=9.5, leading=14, textColor=colors.HexColor('#334155'), spaceAfter=5,
    )

    story = [Paragraph('ATS Resume Analysis Report', title), Spacer(1, 5 * mm)]
    labels = {
        'summary': 'Score Summary',
        'skill_report': 'Skills and Action Items',
        'jd_report': 'Quick Actions',
        'recommendations': 'Job Match and Recommendations',
    }
    for index, (name, html) in enumerate(html_docs.items()):
        if index:
            story.append(PageBreak())
        story.append(Paragraph(labels.get(name, name.replace('_', ' ').title()), section))
        parser = _ReadableHTMLParser()
        parser.feed(html)
        for line in parser.lines():
            story.append(Paragraph(escape(line), body))

    document.build(story)
    return output.getvalue()


def generate_combined_pdf(html_docs: dict[str, str]) -> bytes:
    """Render with WeasyPrint when available, otherwise use pure-Python ReportLab."""
    try:
        from weasyprint import HTML

        documents = [HTML(string=html).render() for html in html_docs.values()]
        first_doc = documents[0]
        for other_doc in documents[1:]:
            first_doc.pages.extend(other_doc.pages)
        return first_doc.write_pdf()
    except (ImportError, OSError) as exc:
        logger.warning('WeasyPrint unavailable; using ReportLab PDF fallback: %s', exc)
        return _generate_reportlab_pdf(html_docs)

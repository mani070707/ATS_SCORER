from pathlib import Path

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.pdfgen.canvas import Canvas


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/pdf/Manideep_Backend_Aryan_Format.pdf"
REF_PNG = ROOT / "tmp/pdfs/aryan-1.png"
LOGO = ROOT / "tmp/pdfs/nsut_logo.png"

PAGE_W, PAGE_H = A4
LEFT, RIGHT = 15 * mm, 15 * mm
CONTENT_W = PAGE_W - LEFT - RIGHT
BLUE = colors.HexColor("#0000EE")
BAR = colors.HexColor("#D8D8D8")
CM_FONT_DIR = ROOT / "tools/fonts"
CM_REGULAR = "CMRoman"
CM_BOLD = "CMBold"
CM_ITALIC = "CMItalic"


def register_computer_modern_fonts():
    """Use the same Computer Modern family embedded in the reference resume."""
    for name, stem in [
        (CM_REGULAR, "cmunrm"),
        (CM_BOLD, "cmunbx"),
        (CM_ITALIC, "cmunti"),
    ]:
        face = pdfmetrics.EmbeddedType1Face(
            str(CM_FONT_DIR / f"{stem}.afm"),
            str(CM_FONT_DIR / f"{stem}.pfb"),
        )
        pdfmetrics.registerTypeFace(face)
        pdfmetrics.registerFont(pdfmetrics.Font(name, face.name, "WinAnsiEncoding"))
    pdfmetrics.registerFontFamily(
        CM_REGULAR,
        normal=CM_REGULAR,
        bold=CM_BOLD,
        italic=CM_ITALIC,
        boldItalic=CM_BOLD,
    )


def crop_logo():
    img = Image.open(REF_PNG).convert("RGB")
    # The reference PDF's NSUT seal, retained because both candidates attend NSUT.
    crop = img.crop((78, 47, 200, 166))
    crop.save(LOGO)


class Resume:
    def __init__(self, canvas):
        self.c = canvas
        self.y = PAGE_H - 12 * mm
        self.body = ParagraphStyle("body", fontName=CM_REGULAR, fontSize=9.70,
                                   leading=11.85, textColor=colors.black, spaceAfter=0)
        self.bullet = ParagraphStyle("bullet", parent=self.body, leftIndent=4.2 * mm,
                                     firstLineIndent=-3.2 * mm, bulletIndent=0.8 * mm)
        self.tech = ParagraphStyle("tech", parent=self.body, fontName=CM_ITALIC,
                                   fontSize=9.30, leading=11.25)

    def para(self, text, style=None, x=LEFT, width=CONTENT_W, after=1.2, align=None):
        st = style or self.body
        if align is not None:
            st = ParagraphStyle("temp", parent=st, alignment=align)
        p = Paragraph(text, st)
        _, h = p.wrap(width, PAGE_H)
        p.drawOn(self.c, x, self.y - h)
        self.y -= h + after
        return h

    def section(self, title):
        self.y -= 2.0
        h = 14.0
        self.c.setFillColor(BAR)
        self.c.rect(LEFT, self.y - h + 1, CONTENT_W, h, fill=1, stroke=0)
        self.c.setFillColor(colors.black)
        self.c.setFont(CM_BOLD, 10.3)
        self.c.drawString(LEFT + 2.2, self.y - 10.4, title.upper())
        self.y -= h + 2.0

    def row(self, left, right="", left_bold=True, right_link=None,
            right_subline="", after=0.4):
        font = CM_BOLD if left_bold else CM_REGULAR
        self.c.setFont(font, 10.0)
        self.c.setFillColor(colors.black)
        self.c.drawString(LEFT, self.y - 7.5, left)
        if right:
            self.c.setFont(CM_REGULAR, 9.2)
            self.c.setFillColor(BLUE if right_link else colors.black)
            tw = stringWidth(right, CM_REGULAR, 9.2)
            self.c.drawString(PAGE_W - RIGHT - tw, self.y - 7.5, right)
            if right_link:
                self.c.linkURL(right_link, (PAGE_W - RIGHT - tw, self.y - 8.5,
                                             PAGE_W - RIGHT, self.y + 1.5), relative=0)
        if right_subline:
            self.c.setFont(CM_ITALIC, 9.0)
            self.c.setFillColor(colors.black)
            sub_w = stringWidth(right_subline, CM_ITALIC, 9.0)
            self.c.drawString(PAGE_W - RIGHT - sub_w, self.y - 18.5, right_subline)
        self.y -= 11.0 + after

    def bullet_line(self, text, after=0.7):
        self.para('<font name="Helvetica">&#8226;</font>&nbsp; ' + text, self.bullet, after=after)


def linked_line(c, y, items):
    widths = []
    for label, url in items:
        font = CM_REGULAR
        widths.append(stringWidth(label, font, 8.6))
    sep = stringWidth("  |  ", CM_REGULAR, 8.6)
    total = sum(widths) + sep * (len(items) - 1)
    x = max((PAGE_W - total) / 2, LEFT + 27 * mm)
    for i, ((label, url), w) in enumerate(zip(items, widths)):
        c.setFont(CM_REGULAR, 8.6)
        c.setFillColor(BLUE if url else colors.black)
        c.drawString(x, y, label)
        if url:
            c.linkURL(url, (x, y - 1.5, x + w, y + 9), relative=0)
        x += w
        if i != len(items) - 1:
            c.setFillColor(colors.black)
            c.drawString(x, y, "  |  ")
            x += sep


def build():
    register_computer_modern_fonts()
    crop_logo()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = Canvas(str(OUT), pagesize=A4, pageCompression=1)
    r = Resume(c)

    c.drawImage(str(LOGO), LEFT + 3, PAGE_H - 37 * mm, 23 * mm, 23 * mm,
                preserveAspectRatio=True, mask="auto")
    c.setFillColor(colors.black)
    c.setFont(CM_BOLD, 17)
    name = "MANIDEEP SINGH"
    c.drawCentredString(PAGE_W / 2, PAGE_H - 20.5 * mm, name)
    linked_line(c, PAGE_H - 27 * mm, [
        ("+91-9711236443", None),
        ("manideepsingh55@gmail.com", "mailto:manideepsingh55@gmail.com"),
        ("LinkedIn", "https://www.linkedin.com/in/manideep55/"),
        ("GitHub", "https://github.com/mani070707"),
        ("LeetCode", "https://leetcode.com/u/mani55/"),
        ("Codeforces", "https://codeforces.com/profile/zmoney"),
    ])
    r.y = PAGE_H - 41 * mm

    r.section("Education")
    data = [
        [Paragraph("<b>Course</b>", r.body), Paragraph("<b>College / University</b>", r.body),
         Paragraph("<b>Year</b>", r.body), Paragraph("<b>CGPA</b>", r.body)],
        [Paragraph("B.Tech. in Information Technology (Network &amp; Information Security)", r.body),
         Paragraph("Netaji Subhas University of Technology (NSUT), Delhi, India", r.body),
         Paragraph("Nov 2022 - Jul 2026", r.body), Paragraph("8.01/10", r.body)],
    ]
    table = Table(data, colWidths=[64 * mm, 73 * mm, 31 * mm, 16 * mm])
    table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), CM_REGULAR), ("FONTSIZE", (0, 0), (-1, -1), 9.15),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEBELOW", (0, 0), (-1, 0), 0.45, colors.black),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 0.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 3.0),
    ]))
    _, h = table.wrap(CONTENT_W, PAGE_H)
    table.drawOn(c, LEFT, r.y - h)
    r.y -= h + 0.5

    r.section("Experience")
    r.row("Zinnia - Software Developer Intern", "Jan 2026 - Jul 2026",
          right_subline="Noida, India")
    r.para("Java 17, Spring Boot, MongoDB, Next.js, TypeScript, EKS", r.tech, after=0.8,
           width=CONTENT_W - 32 * mm)
    r.bullet_line("<b>API Gateway &amp; Orchestration:</b> Designed <b>REST APIs</b> and orchestration workflows for <b>Admin Console</b>, a client-facing onboarding platform spanning <b>6+ microservices</b>, using <b>Java 17, Spring Boot, MongoDB</b>, and a <b>Spring MVC API Gateway</b>.")
    r.bullet_line("<b>Configuration &amp; Lifecycle:</b> Built <b>dynamic product configuration</b> and entity lifecycles (draft - review - publish - active), with <b>multi-stage validation, global exception handling</b>, and consistent API errors.")
    r.bullet_line("<b>Data Integrity &amp; Auditing:</b> Designed <b>MongoDB schemas and indexes</b>; implemented <b>atomic updates, cross-service consistency checks</b>, and project-wide <b>audit logging</b> for entity and configuration changes.")
    r.bullet_line("<b>NES Automation:</b> Built a responsive <b>Next.js and TypeScript</b> interface backed by <b>Spring Boot and MongoDB APIs on EKS</b>; automated production edits through <b>GitHub PRs</b>, reducing issue-resolution time by approximately <b>70%</b>.")
    r.bullet_line("<b>Testing &amp; Logging:</b> Implemented structured logging with <b>SLF4J</b>; added <b>JUnit</b> unit and integration tests, <b>OpenAPI contract validation</b>, and <b>Playwright</b> end-to-end tests.", after=1.0)
    r.y -= 3.5
    r.row("ARK Simplify - Software Engineer Intern", "May 2025 - Jun 2025",
          right_subline="Gurugram, India")
    r.para("Node.js, Express.js, MongoDB, Razorpay", r.tech, after=0.8,
           width=CONTENT_W - 32 * mm)
    r.bullet_line("<b>Backend Development:</b> Developed <b>REST APIs</b> for an internal application using <b>Node.js and MongoDB</b>; implemented <b>request validation, centralized error handling</b>, and <b>role-based authentication</b>.")
    r.bullet_line("<b>Payments &amp; Performance:</b> Integrated <b>Razorpay</b> with <b>server-side verification and webhook handling</b>; optimized queries using <b>indexing and pagination</b>, reducing page-load time by <b>35%</b>.", after=1.0)

    r.section("Projects")
    r.row("AI Fitness Tracker Microservices", "GitHub", right_link="https://github.com/mani070707/AI-Fitness-Tracker-")
    r.para("Java, Spring Boot, PostgreSQL, MongoDB, RabbitMQ, Gemini API", r.tech, after=0.6)
    r.bullet_line("Built <b>Spring Boot microservices and REST APIs</b> for user management, workout tracking, activity history, and personalized recommendations.")
    r.bullet_line("Secured requests with <b>Keycloak OAuth 2.0 and PKCE</b>; configured <b>JWT validation, an API Gateway, Eureka service discovery</b>, and a centralized <b>Config Server</b>.")
    r.bullet_line("Implemented an <b>event-driven RabbitMQ pipeline</b> across <b>MongoDB and PostgreSQL</b> to generate and persist <b>Gemini-powered workout analysis</b>.", after=1.0)
    r.y -= 3.5
    r.row("Map My Hotel", "GitHub", right_link="https://github.com/mani070707/MapMyStay")
    r.para("React.js, TypeScript, Node.js, Express.js, MongoDB", r.tech, after=0.6)
    r.bullet_line("Built a <b>Node.js, Express.js, and MongoDB</b> backend with <b>MVC architecture, RESTful CRUD workflows</b>, and <b>Multer-based image uploads</b>.")
    r.bullet_line("Developed responsive hotel discovery and management flows using <b>React.js and TypeScript</b>, integrating frontend views with <b>backend APIs</b>.")
    r.bullet_line("Implemented <b>Passport.js authentication, salted password hashing, protected routes, request validation</b>, and <b>centralized error handling</b>.", after=1.0)

    r.section("Technical Skills")
    for label, value in [
        ("Languages", "Java"),
        ("Backend &amp; APIs", "Spring Boot, Spring Cloud, REST APIs, Microservices, OpenAPI/Swagger, Node.js, Express.js"),
        ("Frontend", "React.js, Next.js, TypeScript"),
        ("Databases &amp; Messaging", "PostgreSQL, MongoDB, RabbitMQ"),
        ("Security &amp; Cloud", "OAuth 2.0, Keycloak, JWT, Passport.js, AWS, CI/CD"),
        ("Tools &amp; Fundamentals", "Git, GitHub, Maven, JUnit, SLF4J, Playwright, DSA, DBMS, OOP, Operating Systems"),
    ]:
        r.para(f"<b>{label}:</b>&nbsp;&nbsp; {value}", after=0.25)

    r.section("Achievements")
    r.bullet_line("Solved <b>800+ DSA problems</b> across <b>LeetCode, GeeksforGeeks, and HackerRank</b>; reached <b>Codeforces Specialist</b> with a peak rating of <b>1446</b>.")
    r.bullet_line("Won the <b>ConTecl Hackathon</b>; <b>Disease Diagnosis System</b> advanced to the analytics round of <b>Smart India Hackathon 2024</b>.")

    if r.y < 10 * mm:
        raise RuntimeError(f"Content overflow: final y={r.y:.1f}")
    c.setTitle("Manideep Singh - Backend Resume")
    c.setAuthor("Manideep Singh")
    c.save()
    print(OUT)
    print(f"bottom_space_points={r.y:.1f}")


if __name__ == "__main__":
    build()

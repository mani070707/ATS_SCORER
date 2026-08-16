import unittest
from unittest.mock import Mock, patch

from backend.services.groq_parser import (
    _try_parse_json,
    _validate_jd_result,
    _validate_resume_result,
    parse_resume,
)


class GroqParserTests(unittest.TestCase):
    def test_try_parse_json_accepts_plain_json(self):
        self.assertEqual(
            _try_parse_json('{"skills": ["Python"]}'),
            {"skills": ["Python"]},
        )

    def test_try_parse_json_accepts_markdown_fence(self):
        self.assertEqual(
            _try_parse_json('```json\n{"skills": []}\n```'),
            {"skills": []},
        )

    def test_resume_validation_populates_defaults(self):
        result = _validate_resume_result({"name": "Ada"})

        self.assertEqual(result["name"], "Ada")
        self.assertEqual(result["skills"], [])
        self.assertEqual(result["experience"], [])

    def test_jd_validation_rejects_non_object(self):
        with self.assertRaisesRegex(ValueError, 'JSON object'):
            _validate_jd_result(None)

    @patch('backend.services.groq_parser._call_groq')
    @patch('backend.services.groq_parser._get_client')
    def test_parse_resume_returns_valid_first_response(self, get_client, call_groq):
        get_client.return_value = Mock()
        call_groq.return_value = '{"name": "Ada", "skills": ["Python"]}'

        result = parse_resume('Ada resume')

        self.assertEqual(result["name"], "Ada")
        self.assertEqual(result["skills"], ["Python"])
        self.assertEqual(call_groq.call_count, 1)

    @patch('backend.services.groq_parser._call_groq')
    @patch('backend.services.groq_parser._get_client')
    def test_parse_resume_retries_invalid_json(self, get_client, call_groq):
        get_client.return_value = Mock()
        call_groq.side_effect = [
            'not json',
            '{"name": "Grace", "skills": []}',
        ]

        result = parse_resume('Grace resume')

        self.assertEqual(result["name"], "Grace")
        self.assertEqual(call_groq.call_count, 2)


if __name__ == '__main__':
    unittest.main()

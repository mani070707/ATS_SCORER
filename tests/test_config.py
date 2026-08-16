import unittest
from unittest.mock import patch

from backend.core import config


class ConfigTests(unittest.TestCase):
    def test_default_cors_origins_have_no_trailing_slash(self):
        self.assertTrue(all(not origin.endswith('/') for origin in config.ALLOWED_ORIGINS))

    def test_spacy_fallback_name_is_valid(self):
        self.assertEqual(config.SPACY_MODEL_SECONDARY, 'en_core_web_sm')

    @patch.object(config, 'GROQ_API_KEY', 'groq')
    @patch.object(config, 'SUPABASE_KEY', 'service')
    @patch.object(config, 'SUPABASE_ANON_KEY', 'anon')
    @patch.object(config, 'SUPABASE_URL', 'https://example.supabase.co')
    def test_runtime_config_accepts_project_base_url(self):
        self.assertEqual(config.validate_runtime_config(), [])

    @patch.object(config, 'GROQ_API_KEY', 'groq')
    @patch.object(config, 'SUPABASE_KEY', 'service')
    @patch.object(config, 'SUPABASE_ANON_KEY', 'anon')
    @patch.object(config, 'SUPABASE_URL', 'https://example.supabase.co/rest/v1')
    def test_runtime_config_rejects_rest_url(self):
        errors = config.validate_runtime_config()
        self.assertTrue(any('without /rest/v1' in error for error in errors))


if __name__ == '__main__':
    unittest.main()

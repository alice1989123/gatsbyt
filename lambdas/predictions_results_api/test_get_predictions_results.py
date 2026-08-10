import math
import unittest

from get_predictions_results import _readiness


class ReadinessTests(unittest.TestCase):
    def test_empty_sample_is_insufficient(self):
        result = _readiness([], 100, 200, 0.10)
        self.assertEqual(result["status"], "INSUFFICIENT_SAMPLE")
        self.assertEqual(result["closed_paper_trades"], 0)

    def test_preliminary_sample_does_not_pass(self):
        result = _readiness([0.01] * 100, 100, 200, 0.10)
        self.assertEqual(result["status"], "PRELIMINARY")

    def test_consistent_sample_passes(self):
        result = _readiness([0.01] * 200, 100, 200, 0.10)
        self.assertEqual(result["status"], "PAPER_READY")
        self.assertIsNone(result["profit_factor"])
        self.assertTrue(math.isfinite(result["compounded_return_percent"]))


if __name__ == "__main__":
    unittest.main()

import numpy as np

from app.compose import progress_frame


def test_progress_frame_fills_expected_width() -> None:
    resolution = (1080, 1920)
    bar_height = 20
    margin = 40
    frame = progress_frame(0.5, resolution, bar_height, margin, (255, 200, 0), (20, 20, 20))
    bar_width = resolution[0] - margin * 2
    assert frame.shape == (bar_height, bar_width, 3)
    expected_fill = int(bar_width * 0.5)
    filled = np.all(frame[:, :expected_fill] == np.array([255, 200, 0]))
    background = np.all(frame[:, expected_fill:] == np.array([20, 20, 20]))
    assert filled and background

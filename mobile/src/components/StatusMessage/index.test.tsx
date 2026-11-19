import { fireEvent, render, screen } from '@testing-library/react-native';
import { StatusMessage } from '.';

describe('StatusMessage', () => {
  it('shows only the spinner while loading', async () => {
    await render(<StatusMessage loading message="Hidden" onRetry={() => {}} />);

    expect(screen.getByLabelText('Loading')).toBeOnTheScreen();
    expect(screen.queryByText('Hidden')).toBeNull();
    expect(screen.queryByText('Try again')).toBeNull();
  });

  it('shows the message and calls onRetry when the button is pressed', async () => {
    const onRetry = jest.fn();
    await render(<StatusMessage message="Something failed" onRetry={onRetry} />);

    expect(screen.getByText('Something failed')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides the retry button without onRetry', async () => {
    await render(<StatusMessage message="Nothing here" />);

    expect(screen.queryByText('Try again')).toBeNull();
  });
});

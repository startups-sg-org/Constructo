import { render } from '@testing-library/react-native';

import App from '../src/App';

describe('App', () => {
  it('renderiza a tela inicial', async () => {
    const screen = await render(<App />);

    expect(screen.getByText('Constructo')).toBeTruthy();
  });
});

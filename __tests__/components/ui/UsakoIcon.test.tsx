import React from 'react';
import { render } from '@testing-library/react-native';
import { UsakoIcon } from '@/components/ui/UsakoIcon';

describe('UsakoIcon Component', () => {
  it('renders with default small size', () => {
    const { getByTestId } = render(<UsakoIcon />);
    
    const image = getByTestId('usako-icon');
    expect(image).toBeTruthy();
    expect(image.props.style).toEqual([
      { width: 32, height: 32 },
      undefined,
    ]);
  });

  it('renders with medium size', () => {
    const { getByTestId } = render(<UsakoIcon size="medium" />);
    
    const image = getByTestId('usako-icon');
    expect(image.props.style).toEqual([
      { width: 48, height: 48 },
      undefined,
    ]);
  });

  it('renders with large size', () => {
    const { getByTestId } = render(<UsakoIcon size="large" />);
    
    const image = getByTestId('usako-icon');
    expect(image.props.style).toEqual([
      { width: 64, height: 64 },
      undefined,
    ]);
  });

  it('renders with xlarge size', () => {
    const { getByTestId } = render(<UsakoIcon size="xlarge" />);
    
    const image = getByTestId('usako-icon');
    expect(image.props.style).toEqual([
      { width: 96, height: 96 },
      undefined,
    ]);
  });

  it('renders with custom style', () => {
    const customStyle = { marginRight: 12 };
    const { getByTestId } = render(<UsakoIcon style={customStyle} />);
    
    const image = getByTestId('usako-icon');
    expect(image.props.style).toEqual([
      { width: 32, height: 32 },
      customStyle,
    ]);
  });

  it('has correct accessibility properties', () => {
    const { getByTestId } = render(<UsakoIcon />);
    
    const image = getByTestId('usako-icon');
    expect(image.props.accessibilityLabel).toBe('うさこ');
    expect(image.props.accessibilityRole).toBe('image');
  });

  it('supports custom accessibility label', () => {
    const customLabel = 'うさこキャラクター';
    const { getByTestId } = render(<UsakoIcon accessibilityLabel={customLabel} />);
    
    const image = getByTestId('usako-icon');
    expect(image.props.accessibilityLabel).toBe(customLabel);
  });
});
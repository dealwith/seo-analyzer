import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';

jest.useFakeTimers();

describe('useAutoSave', () => {
  it('should not call onSave on initial render', () => {
    const onSave = jest.fn();
    renderHook(() => useAutoSave('initial', onSave, 3000));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('should call onSave after delay when value changes', () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ value }) => useAutoSave(value, onSave, 3000),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    expect(onSave).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('updated');
  });

  it('should debounce multiple rapid changes', () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ value }) => useAutoSave(value, onSave, 3000),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'change1' });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    rerender({ value: 'change2' });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    rerender({ value: 'change3' });
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('change3');
  });

  it('should use custom delay', () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ value }) => useAutoSave(value, onSave, 1000),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(onSave).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('should not call onSave when enabled is false', () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ value, enabled }) => useAutoSave(value, onSave, 3000, enabled),
      { initialProps: { value: 'initial', enabled: false } }
    );

    rerender({ value: 'updated', enabled: false });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('should start saving when enabled changes from false to true', () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ value, enabled }) => useAutoSave(value, onSave, 3000, enabled),
      { initialProps: { value: 'initial', enabled: false } }
    );

    rerender({ value: 'updated', enabled: true });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('updated');
  });

  it('should clear timeout on unmount', () => {
    const onSave = jest.fn();
    const { rerender, unmount } = renderHook(
      ({ value }) => useAutoSave(value, onSave, 3000),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    unmount();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it('should handle object values', () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ value }) => useAutoSave(value, onSave, 3000),
      { initialProps: { value: { text: 'initial' } } }
    );

    const newValue = { text: 'updated' };
    rerender({ value: newValue });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(newValue);
  });
});

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with no toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('should show a toast with correct properties', () => {
    service.show('Test message', 'success');
    const toasts = service.toasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Test message');
    expect(toasts[0].type).toBe('success');
  });

  it('should default to info type', () => {
    service.show('Info message');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should auto-dismiss after default duration', () => {
    service.show('Temp message', 'info');
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(3000);
    expect(service.toasts()).toHaveLength(0);
  });

  it('should auto-dismiss after custom duration', () => {
    service.show('Custom duration', 'info', 5000);
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(3000);
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(2000);
    expect(service.toasts()).toHaveLength(0);
  });

  it('should dismiss a specific toast by id', () => {
    service.show('First', 'info');
    service.show('Second', 'success');
    expect(service.toasts()).toHaveLength(2);
    const firstId = service.toasts()[0].id;
    service.dismiss(firstId);
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].message).toBe('Second');
  });

  it('should handle multiple toasts simultaneously', () => {
    service.show('A', 'info');
    service.show('B', 'success');
    service.show('C', 'error');
    expect(service.toasts()).toHaveLength(3);
    expect(service.toasts().map((t) => t.type)).toEqual(['info', 'success', 'error']);
  });

  it('should assign unique ids to each toast', () => {
    service.show('A', 'info');
    service.show('B', 'info');
    const ids = service.toasts().map((t) => t.id);
    expect(ids[0]).not.toBe(ids[1]);
  });
});

import { describe, it, expect } from 'vitest'
import { toFileYAMLSyntax, toOldWidgetYAMLSyntax, fromFileYAMLSyntax } from './yaml-file-format'

describe('yaml-file-format', () => {
  const sampleWidget = {
    uid: 'widget_sample',
    component: 'f7-card',
    config: { title: 'Test Title' },
    editable: true,
    timestamp: '12345'
  }

  describe('toFileYAMLSyntax', () => {
    it('converts a single widget to new file YAML format', () => {
      const result = toFileYAMLSyntax('widgets', sampleWidget)
      expect(result).toContain('version: 1')
      expect(result).toContain('widgets:')
      expect(result).toContain('widget_sample:')
      expect(result).toContain('component: f7-card')
      expect(result).not.toContain('editable')
      expect(result).not.toContain('timestamp')
    })
  })

  describe('toOldWidgetYAMLSyntax', () => {
    it('converts a single widget to old YAML format', () => {
      const result = toOldWidgetYAMLSyntax(sampleWidget)
      expect(result).toContain(`uid: widget_sample\ncomponent: f7-card\nconfig:\n  title: Test Title`)
      expect(result).not.toContain('editable')
      expect(result).not.toContain('timestamp')
    })
  })

  describe('fromFileYAMLSyntax', () => {
    it('parses new YAML format', () => {
      const yaml = toFileYAMLSyntax('widgets', sampleWidget)
      const parsed = fromFileYAMLSyntax<{ uid: string; component: string }>('widgets', yaml, 'widget_sample')
      expect(parsed.uid).toBe('widget_sample')
      expect(parsed.component).toBe('f7-card')
    })

    it('parses old YAML format', () => {
      const oldYaml = 'uid: widget_sample\ncomponent: f7-card\nconfig:\n  title: Test Title'
      const parsed = fromFileYAMLSyntax<{ uid: string; component: string }>('widgets', oldYaml, 'widget_sample')
      expect(parsed.uid).toBe('widget_sample')
      expect(parsed.component).toBe('f7-card')
    })
  })
})

'use client'
import type { ChangeEvent } from 'react'

import { getTranslation } from '@payloadcms/translations'
import { fieldBaseClass, FieldDescription, FieldError, FieldLabel, RenderCustomComponent, useDebounce, useTranslation } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import type { IconPickerInputProps } from './types'

const baseClass = 'icon'

export const IconPickerInput: React.FC<IconPickerInputProps> = (props) => {
  const {
    AfterInput,
    BeforeInput,
    className,
    Description,
    description,
    Error,
    inputRef,
    Label,
    label,
    localized,
    onChange,
    onKeyDown,
    path,
    placeholder,
    readOnly,
    required,
    rtl,
    showError,
    style,
    value,
    icons,
  } = props

  const [fieldIsFocused, setFieldIsFocused] = useState(false)
  const [search, setSearch] = useState('')
  const [filteredIcons, setFilteredIcons] = useState(icons)
  const [hoveredIcon, setHoveredIcon] = useState<null | string>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { i18n, t } = useTranslation()

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.value.startsWith('#')) {
      evt.target.value = `#${evt.target.value}`
    }

    evt.target.value = evt.target.value.replace(/[^a-f0-9#]/gi, '').slice(0, 7)

    onChange?.(evt as any)
  }

  useEffect(() => {
    if (!icons) return

    if (debouncedSearch == '') {
      setFilteredIcons(icons)
    } else {
      const foundIcons: any = {}
      Object.keys(icons).forEach(icon => {
        if (icon.toLowerCase().includes(debouncedSearch.toLowerCase())) {
          foundIcons[icon] = icons[icon]
        }
      })
      setFilteredIcons(foundIcons)
    }
  }, [debouncedSearch, icons])

  return (
    <div
      className={[
        fieldBaseClass,
        'icon',
        className,
        showError && 'error',
        readOnly && 'read-only',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <RenderCustomComponent
        CustomComponent={Label}
        Fallback={
          <FieldLabel label={label} localized={localized} path={path} required={required} />
        }
      />
      <div className={`${fieldBaseClass}__wrap`}>
        <RenderCustomComponent
          CustomComponent={Error}
          Fallback={<FieldError path={path} showError={showError} />}
        />
        {BeforeInput}
        <div
          className={`${baseClass}__input-container`}
          onFocus={() => setFieldIsFocused(true)}
          onBlur={e => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setTimeout(() => {
                setFieldIsFocused(false);
                setSearch("")
              }, 200)
            }
          }}
        >
          {!rtl && (
            <div className={`${baseClass}__icon-preview`} onClick={() => setFieldIsFocused(true)}>
              <span dangerouslySetInnerHTML={{ __html: (value && icons && icons[value]) || '' }} />
            </div>
          )}
          <input
            data-rtl={rtl}
            disabled={readOnly}
            id={`field-${path.replace(/\./g, '__')}`}
            name={path}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            placeholder={getTranslation(placeholder as string, i18n)}
            ref={inputRef}
            type="text"
            value={value || ''}
          />
          {rtl && (
            <div className={`${baseClass}__icon-preview`} onClick={() => setFieldIsFocused(true)}>
              <span dangerouslySetInnerHTML={{ __html: (value && icons && icons[value]) || '' }} />
            </div>
          )}
          {fieldIsFocused && (
            <div
              className={`${baseClass}__icon-picker-modal ${rtl ? `${baseClass}__icon-picker-modal--rtl` : ''
                }`}
            >
              <div className={`${baseClass}__icon-picker-modal__pagination-meta-container`}>
              <span>
                  Showing
                  {' '}
                  {Object.keys(filteredIcons as Record<string, string>).length > 1000
                    ? 1000
                    : Object.keys(filteredIcons as Record<string, string>).length}{' '}
                  icons of {Object.keys(icons as Record<string, string>).length}
                </span>
              </div>
              <div className={`${baseClass}__icon-picker-modal__icon-container`}>
                {typeof filteredIcons === 'object' && Object.keys(filteredIcons as Record<string, string>)
                  .slice(0, 1000)
                  .map((icon, index) => (
                    <div
                      onClick={() => {
                        onChange?.({
                          target: {
                            name: path,
                            value: icon,
                          },
                        } as ChangeEvent<HTMLInputElement>)
                        setFieldIsFocused(false)
                        setFilteredIcons(icons)
                      }}
                      title={icon}
                      onMouseOver={() => setHoveredIcon(icon)}
                      className={`${baseClass}__icon-picker-modal__icon-option ${value == icon ? `${baseClass}__icon-picker-modal__icon-option-active` : ''
                        }`}
                      key={index}
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: (icon && icons && icons[icon]) || '',
                        }}
                      />
                    </div>
                  ))}
                {typeof filteredIcons === 'object' && Object.keys(filteredIcons as Record<string, string>).length == 0 && (
                  <span>No icons found</span>
                )}
              </div>
              <div className={`${baseClass}__icon-picker-modal__icon-search`}>
                <input
                  type="search"
                  className="search_field"
                  onChange={e => {
                    setSearch(e.target.value)
                  }}
                  placeholder={hoveredIcon || 'Search icons...'}
                  data-rtl={rtl}
                />
              </div>
            </div>
          )}
        </div>
        {AfterInput}
        <RenderCustomComponent
          CustomComponent={Description}
          Fallback={<FieldDescription description={description} path={path} />}
        />
      </div>
    </div>
  )
}

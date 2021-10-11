import { h } from 'preact';
import { useState, useEffect } from 'preact/compat';
import { Button, Checkbox, TextField } from 'yamdl';
import RemoveIcon from '@material-ui/icons/Remove';
import OrgIcon from '../../../../components/org-icon';
import { CountryFlag } from '../../../../components/data/country';
import { IdUEACode } from '../../../../components/data/uea-code';
import { country, timestamp } from '../../../../components/data';
import CountryPicker from '../../../../components/country-picker';
import CodeholderPicker from '../../../../components/codeholder-picker';
import Segmented from '../../../../components/segmented';
import { Validator } from '../../../../components/form';
import Select from '../../../../components/select';
import TextArea from '../../../../components/text-area';
import { delegations as locale, delegationSubjects as subjectsLocale } from '../../../../locale';
import GeoCity from './geo-city';
import Subject from './subject';
import CityPicker from './city-picker';
import SubjectPicker from '../subjects/subject-picker';

export const FIELDS = {
    org: {
        sortable: true,
        weight: 0.3,
        slot: 'icon',
        component ({ value, editing, onChange, slot }) {
            if (slot === 'create' && editing) {
                return (
                    <Segmented selected={value} onSelect={onChange}>
                        {['uea'].map(id => ({ id, label: <OrgIcon org={id} /> }))}
                    </Segmented>
                );
            }
            return <OrgIcon org={value} />;
        },
    },
    codeholderId: {
        sortable: true,
        weight: 0.3,
        slot: 'title',
        component ({ value, editing, onChange, slot }) {
            if (slot === 'create' && editing) {
                return (
                    <CodeholderPicker
                        value={value ? [value] : []}
                        onChange={v => onChange(v[0] || null)}
                        limit={1} />
                );
            }
            if (!value) return '—';
            return <IdUEACode id={value} />;
        },
    },
    approvedBy: {
        component ({ value }) {
            if (!value) return '—';
            let content;
            if (value.startsWith('ch:')) {
                content = <IdUEACode id={value.substr(3)} />;
            } else if (value.startsWith('app:')) {
                // TODO: this
                content = 'todo';
            }

            return (
                <div class="delegation-approved-by">
                    {content}
                </div>
            );
        },
    },
    approvedTime: {
        component ({ value }) {
            if (!value) return null;
            return <timestamp.renderer value={value} />;
        },
    },
    cities: {
        component ({ value, editing, onChange }) {
            const [pickerOpen, setPickerOpen] = useState(false);
            if (!value && !editing) return null;
            if (!value) value = [];

            const removeCity = id => {
                const newValue = [...value];
                newValue.splice(newValue.indexOf(id), 1);
                onChange(newValue);
            };

            return (
                <div class="delegation-cities">
                    {value.map(id => (
                        <div class={'delegation-city' + (editing ? ' is-editing' : '')} key={id}>
                            {editing ? (
                                <div class="city-remove-container">
                                    <Button clas="remove-button" icon small onClick={() => removeCity(id)}>
                                        <RemoveIcon style={{ verticalAlign: 'middle' }} />
                                    </Button>
                                </div>
                            ) : null}
                            <GeoCity class="inner-city" id={id} />
                        </div>
                    ))}

                    {editing ? (
                        <div class="cities-editing">
                            <Button class="pick-button" onClick={() => setPickerOpen(true)}>{locale.cityPicker.pick}</Button>
                            <CityPicker
                                value={value}
                                onChange={onChange}
                                limit={10}
                                open={pickerOpen}
                                onClose={() => setPickerOpen(false)} />
                        </div>
                    ) : null}
                </div>
            );
        },
    },
    countries: {
        component ({ value, editing, onChange, item, userData }) {
            if (editing) {
                const hasPerm = p => !userData?.hasPerm || userData.hasPerm(p);
                if (!value) value = [];

                return (
                    <div class="delegation-countries is-editing">
                        <CountryPicker
                            value={value.map(x => x.country)}
                            onChange={newValue => {
                                onChange(newValue.map(country => ({
                                    country,
                                    level: value.find(x => x.country === country)?.level || 0,
                                })).slice(0, 10));
                            }}
                            hideGroups
                            shouldHideItem={country =>
                                !hasPerm(`codeholders.delegations.update_country_delegates.${item.org}.${country}`)} />
                        <div class="country-levels-title">
                            {locale.countryLevelsTitle}
                        </div>
                        <div class="country-levels">
                            {value.map((item, index) => (
                                <div class="country-item" key={item.country}>
                                    <div class="country-label">
                                        <country.renderer value={item.country} />
                                    </div>
                                    <div class="country-level">
                                        <Select
                                            value={item.level}
                                            onChange={level => {
                                                const newValue = [...value];
                                                newValue[index] = { ...item, level: level | 0 };
                                                onChange(newValue);
                                            }}
                                            items={Object.entries(locale.countryLevels).map(([k, v]) => ({
                                                value: k,
                                                label: v,
                                            }))} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            if (!value) return '—';
            return (
                <div class="delegation-countries">
                    {value.map(({ country, level }) => (
                        <span class="delegation-country" key={country}>
                            <CountryFlag country={country} />
                            <span class="country-level">{locale.countryLevels[level]}</span>
                        </span>
                    ))}
                </div>
            );
        },
    },
    subjects: {
        component ({ value, editing, onChange }) {
            const [pickerOpen, setPickerOpen] = useState(false);

            if (!value && !editing) return null;
            if (!value) value = [];

            return (
                <div class="delegation-subjects">
                    {value.map(id => <Subject key={id} id={id} />)}
                    {editing ? (
                        <Button onClick={() => setPickerOpen(true)}>
                            {subjectsLocale.picker.pick}
                            <SubjectPicker
                                value={value}
                                onChange={onChange}
                                open={pickerOpen}
                                onClose={() => setPickerOpen(false)}
                                limit={50} />
                        </Button>
                    ) : null}
                </div>
            );
        },
    },
    hosting: {
        component ({ value, editing, onChange }) {
            const editable = (disp, edit) => editing ? edit : disp;

            if (!editing && !(value && Object.values(value).find(x => x))) return null;
            if (!value) value = {};

            return (
                <div class="delegation-hosting is-editing">
                    <div class="hosting-max-days">
                        <label>{locale.hosting.maxDays}</label>
                        {editable(
                            value.maxDays,
                            <TextField
                                type="number"
                                outline
                                placeholder={locale.hosting.maxDaysNone}
                                value={value.maxDays || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    onChange({ ...value, maxDays: +val > 0 ? +val : null });
                                }} />
                        )}
                    </div>
                    <div class="hosting-max-persons">
                        <label>{locale.hosting.maxPersons}</label>
                        {editable(
                            value.maxPersons,
                            <TextField
                                type="number"
                                outline
                                placeholder={locale.hosting.maxPersonsNone}
                                value={value.maxPersons || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    onChange({ ...value, maxPersons: +val > 0 ? +val : null });
                                }} />
                        )}
                    </div>
                    <div class="hosting-description">
                        <label>{locale.hosting.description}</label>
                        {editable(
                            value.description,
                            <TextArea
                                value={value.description || ''}
                                onChange={val => onChange({ ...value, description: val || null })} />
                        )}
                    </div>
                    <div class="hosting-ps-profile-url">
                        <label>{locale.hosting.psProfileURL}</label>
                        {editable(
                            value.psProfileURL,
                            <Validator
                                component={TextField}
                                validate={value => {
                                    if (!value) return;
                                    if (!value.match(/^https:\/\/www\.pasportaservo\.org\/ejo\/\d+\/?$/)) {
                                        throw { error: locale.hosting.psProfileURLInvalid };
                                    }
                                }}
                                type="url"
                                placeholder="https://www.pasportaservo.org/ejo/..."
                                outline
                                value={value.psProfileURL || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    onChange({ ...value, psProfileURL: val || null });
                                }} />
                        )}
                    </div>
                </div>
            );
        },
        isEmpty: value => !value || !Object.values(value).find(x => x),
    },
    tos: {
        component ({ value, editing, onChange }) {
            const required = [
                'docDataProtectionUEA',
                'docDelegatesUEA',
                'docDelegatesDataProtectionUEA',
            ];
            const fieldNames = [
                ...required,
                'paperAnnualBook',
            ];

            if (!value) value = {};

            useEffect(() => {
                if (editing) {
                    const newValue = { ...value };
                    let changed = false;
                    for (const fieldName of fieldNames) {
                        if (required.includes(fieldName) && !newValue[fieldName]) {
                            newValue[fieldName] = true;
                            changed = true;
                        }
                    }
                    if (changed) onChange(newValue);
                }
            });

            const fields = [];
            for (const fieldName of fieldNames) {
                const checkboxId = 'tosf-' + Math.random().toString(36);
                fields.push(
                    <div class="tos-field" key={fieldName}>
                        <div class="field-checkbox">
                            <label for={checkboxId}>{locale.tos[fieldName]}</label>
                            <Checkbox
                                id={checkboxId}
                                checked={value[fieldName]}
                                onChange={checked => {
                                    if (!editing) return;
                                    onChange({
                                        ...value,
                                        [fieldName]: checked,
                                        [fieldName + 'Time']: Math.floor(Date.now() / 1000),
                                    });
                                }}
                                disabled={required.includes(fieldName)} />
                        </div>
                        <div class="field-time">
                            <label>{locale.tos.fieldTime}</label>
                            <timestamp.renderer value={value[fieldName + 'Time']} />
                        </div>
                    </div>
                );
            }

            return (
                <div class="delegation-tos">
                    {fields}
                </div>
            );
        },
    },
};
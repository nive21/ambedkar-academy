import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const qualificationOptions = [
  'Class 10',
  'Class 12',
  'Diploma',
  'Undergraduate',
  'Postgraduate',
  'Doctorate'
];

const communityOptions = ['SC', 'ST'];
const examOptions = ['Group I', 'Group II', 'Group III', 'Group IV', 'Technical exams'];

const initialFormValues = {
  candidateFullName: '',
  dateOfBirth: '',
  gender: '',
  aadharNumber: '',
  permanentAddress: '',
  city: '',
  pincode: '',
  email: '',
  contactNumber: '',
  qualification: '',
  community: '',
  motherName: '',
  motherOccupation: '',
  fatherName: '',
  fatherOccupation: '',
  previousCoaching: '',
  previousCoachingYear: ''
};

function FormField({
  label,
  name,
  type = 'text',
  required = false,
  placeholder = '',
  error = '',
  children,
  ...props
}) {
  return (
    <label className="book-hall-field">
      <span className="book-hall-field__label">
        {label}
        {required ? ' *' : ''}
      </span>
      {children ?? (
        <input
          className={`book-hall-field__control${error ? ' apply-page__control--error' : ''}`}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
      )}
      {error ? (
        <span className="apply-page__field-error" id={`${name}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function FieldHint({ children }) {
  return <span className="apply-page__field-hint">{children}</span>;
}

function normalizeDigits(value) {
  return value.replace(/\D/g, '');
}

function getFieldError(name, value, values) {
  const trimmedValue = typeof value === 'string' ? value.trim() : value;

  switch (name) {
    case 'candidateFullName':
      if (!trimmedValue) return 'Full name is required.';
      if (trimmedValue.length < 3) return 'Enter at least 3 characters for the full name.';
      return '';
    case 'dateOfBirth':
      if (!trimmedValue) return 'Date of birth is required.';
      if (new Date(trimmedValue) > new Date()) return 'Date of birth cannot be in the future.';
      return '';
    case 'gender':
      if (!trimmedValue) return 'Please select a gender.';
      return '';
    case 'aadharNumber':
      if (!trimmedValue) return 'Aadhar number is required.';
      if (!/^\d{12}$/.test(trimmedValue)) return 'Aadhar number must be exactly 12 digits.';
      return '';
    case 'permanentAddress':
      if (!trimmedValue) return 'Permanent address is required.';
      if (trimmedValue.length < 10) return 'Enter a more complete permanent address.';
      return '';
    case 'city':
      if (!trimmedValue) return 'City is required.';
      if (trimmedValue.length < 2) return 'Enter a valid city name.';
      return '';
    case 'pincode':
      if (!trimmedValue) return 'Pincode is required.';
      if (!/^\d{6}$/.test(trimmedValue)) return 'Pincode must be exactly 6 digits.';
      return '';
    case 'email':
      if (!trimmedValue) return 'Email ID is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) return 'Enter a valid email address.';
      return '';
    case 'contactNumber':
      if (!trimmedValue) return 'Contact number is required.';
      if (!/^\d{10}$/.test(trimmedValue)) return 'Contact number must be exactly 10 digits.';
      return '';
    case 'qualification':
      if (!trimmedValue) return 'Educational qualification is required.';
      return '';
    case 'community':
      if (!trimmedValue) return 'Community is required.';
      return '';
    case 'motherName':
      if (!trimmedValue) return "Mother's name is required.";
      return '';
    case 'motherOccupation':
      if (!trimmedValue) return "Mother's occupation is required.";
      return '';
    case 'fatherName':
      if (!trimmedValue) return "Father's name is required.";
      return '';
    case 'fatherOccupation':
      if (!trimmedValue) return "Father's occupation is required.";
      return '';
    case 'previousCoaching':
      if (!trimmedValue) return 'Please choose whether you attended previously.';
      return '';
    case 'previousCoachingYear':
      if (values.previousCoaching !== 'yes') return '';
      if (!trimmedValue) return 'Please enter the previous coaching year.';
      if (!/^\d{4}$/.test(trimmedValue)) return 'Enter a valid 4-digit year.';
      return '';
    default:
      return '';
  }
}

function getAllErrors(values) {
  return Object.keys(initialFormValues).reduce((acc, key) => {
    const error = getFieldError(key, values[key], values);
    if (error) {
      acc[key] = error;
    }
    return acc;
  }, {});
}

export default function ApplyPage() {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [selectedExams, setSelectedExams] = useState([]);
  const [formStatus, setFormStatus] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateField(name, value, nextValues = formValues) {
    const error = getFieldError(name, value, nextValues);
    setFieldErrors((current) => ({
      ...current,
      [name]: error
    }));
    return error;
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    const normalizedValue =
      name === 'aadharNumber'
        ? normalizeDigits(value).slice(0, 12)
        : name === 'pincode'
          ? normalizeDigits(value).slice(0, 6)
          : name === 'contactNumber'
            ? normalizeDigits(value).slice(0, 10)
            : name === 'previousCoachingYear'
              ? normalizeDigits(value).slice(0, 4)
              : value;

    const nextValues = {
      ...formValues,
      [name]: normalizedValue
    };

    if (name === 'previousCoaching' && value !== 'yes') {
      nextValues.previousCoachingYear = '';
    }

    setFormValues(nextValues);
    setFormStatus('');
    setFormError('');

    if (touchedFields[name]) {
      validateField(name, nextValues[name], nextValues);
    }

    if (name === 'previousCoaching') {
      validateField('previousCoaching', nextValues.previousCoaching, nextValues);
      validateField('previousCoachingYear', nextValues.previousCoachingYear, nextValues);
    }
  }

  function handleFieldBlur(event) {
    const { name } = event.target;
    setTouchedFields((current) => ({
      ...current,
      [name]: true
    }));
    validateField(name, formValues[name]);
  }

  function handleExamToggle(event) {
    const { value, checked } = event.target;
    setSelectedExams((current) =>
      checked ? [...current, value] : current.filter((exam) => exam !== value)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = getAllErrors(formValues);
    setTouchedFields(
      Object.keys(initialFormValues).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormStatus('');
      setFormError('Please correct the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        full_name: formValues.candidateFullName.trim(),
        date_of_birth: formValues.dateOfBirth,
        gender: formValues.gender,
        permanent_address: formValues.permanentAddress.trim(),
        city: formValues.city.trim(),
        pincode: formValues.pincode,
        email: formValues.email.trim(),
        contact_number: formValues.contactNumber,
        aadhar_number: formValues.aadharNumber,
        educational_qualification: formValues.qualification,
        community: formValues.community,
        mother_name: formValues.motherName.trim(),
        mother_occupation: formValues.motherOccupation.trim(),
        father_name: formValues.fatherName.trim(),
        father_occupation: formValues.fatherOccupation.trim(),
        tnpsc_exams: selectedExams,
        previous_coaching: formValues.previousCoaching === 'yes',
        previous_coaching_year:
          formValues.previousCoaching === 'yes' ? Number(formValues.previousCoachingYear) : null
      };

      const { error } = await supabase.from('group_iv_applications_2026').insert(payload);

      if (error) {
        throw new Error(error.message || 'Unable to submit application.');
      }

      setFormValues(initialFormValues);
      setTouchedFields({});
      setFieldErrors({});
      setSelectedExams([]);
      setFormStatus('Application submitted successfully.');
    } catch (error) {
      setFormStatus('');
      setFormError(error instanceof Error ? error.message : 'Unable to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="book-hall-page apply-page">
      <div className="book-hall-page__line" />
      <section className="book-hall-shell">
        <header className="book-hall-header apply-page__header">
          <a className="book-hall-back" href="/">
            Back to home
          </a>
        </header>

        <section className="book-hall-form-wrap apply-page__form-wrap" aria-label="Free coaching application form">
          <h2 className="book-hall-form-title">Group IV Coaching Application</h2>

          <p className="book-hall-form-note apply-page__notice">
            Dr. Ambedkar Academy is offering free coaching for TNPSC Group IV exams to SC and ST candidates. Deserving candidates will be provided free residential facilities. Eligible candidates are encouraged to apply and attend the interview.
            <br /><br />
            Candidates must submit their forms by August 15, 2026 and attend the interview in person at <i>Dr Ambedkar
            Academy, The People&apos;s Educational Trust, 73, L-Block, 24th Street, Anna Nagar
            East, Chennai 600 102</i>. Interviews will be held on August 16 and August 17, 2026.
            <br /><br />
            Please bring your Aadhar card, a passport-size photograph,
            education proof, and community certificate. Classes for selected candidates will
            commence on August 18, 2026.
          </p>

          <form className="book-hall-form" onSubmit={handleSubmit} noValidate>
            <div className="book-hall-form__row">
              <FormField
                label="Full Name Of The Candidate"
                name="candidateFullName"
                required
                placeholder="Enter the candidate's full name"
                value={formValues.candidateFullName}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.candidateFullName}
              />
              <FormField
                label="Date Of Birth"
                name="dateOfBirth"
                type="date"
                required
                value={formValues.dateOfBirth}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.dateOfBirth}
              />
            </div>

            <div className="book-hall-form__row">
              <FormField label="Gender" name="gender" required error={fieldErrors.gender}>
                <select
                  className={`book-hall-field__control${fieldErrors.gender ? ' apply-page__control--error' : ''}`}
                  name="gender"
                  required
                  value={formValues.gender}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  aria-invalid={Boolean(fieldErrors.gender)}
                  aria-describedby={fieldErrors.gender ? 'gender-error' : undefined}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </FormField>
              <FormField
                label="Aadhar Number"
                name="aadharNumber"
                required
                placeholder="Enter 12-digit Aadhar number"
                inputMode="numeric"
                value={formValues.aadharNumber}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.aadharNumber}
              />
            </div>

            <FormField
              label="Permanent Address"
              name="permanentAddress"
              required
              error={fieldErrors.permanentAddress}
            >
              <textarea
                className={`book-hall-field__control book-hall-field__control--textarea apply-page__textarea${fieldErrors.permanentAddress ? ' apply-page__control--error' : ''}`}
                name="permanentAddress"
                required
                placeholder="Enter full permanent address"
                value={formValues.permanentAddress}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                aria-invalid={Boolean(fieldErrors.permanentAddress)}
                aria-describedby={fieldErrors.permanentAddress ? 'permanentAddress-error' : undefined}
              />
            </FormField>

            <div className="book-hall-form__row">
              <FormField
                label="City"
                name="city"
                required
                placeholder="Enter city"
                value={formValues.city}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.city}
              />
              <FormField
                label="Pincode"
                name="pincode"
                required
                placeholder="Enter pincode"
                inputMode="numeric"
                value={formValues.pincode}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.pincode}
              />
            </div>

            <div className="book-hall-form__row">
              <FormField
                label="Email ID"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                value={formValues.email}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.email}
              />
              <FormField
                label="Contact Number"
                name="contactNumber"
                type="tel"
                required
                placeholder="Enter 10-digit contact number"
                inputMode="numeric"
                value={formValues.contactNumber}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.contactNumber}
              />
            </div>

            <div className="book-hall-form__row">
              <FormField label="Educational Qualification" name="qualification" required error={fieldErrors.qualification}>
                <select
                  className={`book-hall-field__control${fieldErrors.qualification ? ' apply-page__control--error' : ''}`}
                  name="qualification"
                  required
                  value={formValues.qualification}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  aria-invalid={Boolean(fieldErrors.qualification)}
                  aria-describedby={fieldErrors.qualification ? 'qualification-error' : undefined}
                >
                  <option value="" disabled>
                    Select qualification
                  </option>
                  {qualificationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FieldHint>Minimum Class 10 is required for eligibility.</FieldHint>
              </FormField>
              <FormField label="Community" name="community" required error={fieldErrors.community}>
                <select
                  className={`book-hall-field__control${fieldErrors.community ? ' apply-page__control--error' : ''}`}
                  name="community"
                  required
                  value={formValues.community}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  aria-invalid={Boolean(fieldErrors.community)}
                  aria-describedby={fieldErrors.community ? 'community-error' : undefined}
                >
                  <option value="" disabled>
                    Select community
                  </option>
                  {communityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FieldHint>Only SC and ST candidates are eligible for these coaching classes.</FieldHint>
              </FormField>
            </div>

            <div className="book-hall-form__row">
              <FormField
                label="Mother's Name"
                name="motherName"
                required
                placeholder="Enter mother's name"
                value={formValues.motherName}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.motherName}
              />
              <FormField
                label="Mother's Occupation"
                name="motherOccupation"
                required
                placeholder="Enter mother's occupation"
                value={formValues.motherOccupation}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.motherOccupation}
              />
            </div>

            <div className="book-hall-form__row">
              <FormField
                label="Father's Name"
                name="fatherName"
                required
                placeholder="Enter father's name"
                value={formValues.fatherName}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.fatherName}
              />
              <FormField
                label="Father's Occupation"
                name="fatherOccupation"
                required
                placeholder="Enter father's occupation"
                value={formValues.fatherOccupation}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={fieldErrors.fatherOccupation}
              />
            </div>

            <fieldset className="apply-page__fieldset">
              <legend className="book-hall-field__label">Previous TNPSC Examinations Appeared For</legend>
              <div className="apply-page__checkbox-grid">
                {examOptions.map((option) => (
                  <label className="apply-page__checkbox" key={option}>
                    <input
                      type="checkbox"
                      name="tnpscExams"
                      value={option}
                      checked={selectedExams.includes(option)}
                      onChange={handleExamToggle}
                    />
                    <span className="apply-page__option-label">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="apply-page__fieldset">
              <legend className="book-hall-field__label">
                Participated In Ambedkar Academy Free Coaching Previously? *
              </legend>
              <div
                className="apply-page__radio-row"
                aria-invalid={Boolean(fieldErrors.previousCoaching)}
                aria-describedby={fieldErrors.previousCoaching ? 'previousCoaching-error' : undefined}
              >
                <label className="apply-page__choice">
                  <input
                    type="radio"
                    name="previousCoaching"
                    value="yes"
                    checked={formValues.previousCoaching === 'yes'}
                    onChange={handleFieldChange}
                    onBlur={handleFieldBlur}
                  />
                  <span className="apply-page__option-label">Yes</span>
                </label>
                <label className="apply-page__choice">
                  <input
                    type="radio"
                    name="previousCoaching"
                    value="no"
                    checked={formValues.previousCoaching === 'no'}
                    onChange={handleFieldChange}
                    onBlur={handleFieldBlur}
                  />
                  <span className="apply-page__option-label">No</span>
                </label>
              </div>
              {fieldErrors.previousCoaching ? (
                <p className="apply-page__field-error" id="previousCoaching-error" role="alert">
                  {fieldErrors.previousCoaching}
                </p>
              ) : null}
              {formValues.previousCoaching === 'yes' ? (
                <div className="book-hall-form__row book-hall-form__row--1col apply-page__followup-row">
                  <FormField
                    label="If Yes, Which Year?"
                    name="previousCoachingYear"
                    required
                    placeholder="Enter the year of previous coaching"
                    inputMode="numeric"
                    value={formValues.previousCoachingYear}
                    onChange={handleFieldChange}
                    onBlur={handleFieldBlur}
                    error={fieldErrors.previousCoachingYear}
                  />
                </div>
              ) : null}
            </fieldset>

            {formError ? <p className="book-hall-status book-hall-status--error">{formError}</p> : null}
            {formStatus ? <p className="book-hall-status book-hall-status--success">{formStatus}</p> : null}

            <div className="book-hall-submit-row">
              <button className="book-hall-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}

import styles from './Checkbox.module.css';

interface CheckboxProps {
  id: string;
  label: React.ReactNode;
  checked?: boolean;
  required?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({
  id,
  label,
  checked,
  required = false,
  onChange,
}: CheckboxProps) {
  return (
    <div className={styles.checkbox}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        required={required}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <label htmlFor={id}>
        <span className={styles.box}></span>
        {label}
      </label>
    </div>
  );
}

import React from 'react';

interface CodeBlockProps {
  data: Record<string, unknown>;
  className?: string;
}

const formatValue = (value: unknown, indent: number = 2): string => {
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map(v => ' '.repeat(indent + 2) + formatValue(v, indent + 2));
    return `[\n${items.join(',\n')}\n${' '.repeat(indent)}]`;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
      .split('\n')
      .map((line, i) => (i === 0 ? line : ' '.repeat(indent) + line))
      .join('\n');
  }
  return String(value);
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ data, className = '' }) => {
  const renderJson = () => {
    const entries = Object.entries(data);
    return entries.map(([key, value], index) => {
      const formattedValue = formatValue(value);
      const isLast = index === entries.length - 1;
      const comma = isLast ? '' : ',';

      let valueClass = '';
      if (typeof value === 'string') valueClass = 'string';
      else if (typeof value === 'number') valueClass = 'number';
      else if (typeof value === 'boolean') valueClass = 'boolean';

      if (typeof value === 'object' && value !== null) {
        return (
          <div key={key}>
            <span className="key">{`  "${key}"`}</span>
            <span>{': '}</span>
            <span>{formattedValue}</span>
            <span>{comma}</span>
          </div>
        );
      }

      return (
        <div key={key}>
          <span className="key">{`  "${key}"`}</span>
          <span>{': '}</span>
          <span className={valueClass}>{formattedValue}</span>
          <span>{comma}</span>
        </div>
      );
    });
  };

  return (
    <pre className={`code-block ${className}`}>
      <code>
        <span>{'{'}</span>
        {renderJson()}
        <span>{'}'}</span>
      </code>
    </pre>
  );
};

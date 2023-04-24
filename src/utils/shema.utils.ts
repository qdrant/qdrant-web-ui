export const formatErrors = <T>(
  /** @type {import('zod').ZodFormattedError<Map<string,string>,string>} */
  errors: Record<string, any>
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${(value._errors as any).join(", ")}\n`;
    })
    .filter(Boolean);

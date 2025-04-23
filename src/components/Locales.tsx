import { ReactNode } from 'react';

// third-party
import { IntlProvider } from 'react-intl';

// project-imports
import useConfig from 'hooks/useConfig';

interface Props {
  children: ReactNode;
}

// ==============================|| LOCALIZATION ||============================== //

export default function Locales({ children }: Props) {
  const { i18n } = useConfig();

  // Default empty messages to avoid errors
  const messages = {};

  return (
    <IntlProvider locale={i18n || 'en'} defaultLocale="en" messages={messages}>
      {children}
    </IntlProvider>
  );
}

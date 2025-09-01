
// material-ui
import {
    AccountBalance,
    AccountBalanceWallet,
    CardGiftcard,
    Payment
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';

interface TransactionProps {
  title: string;
  color: string;
  amount: string;
  icon?: string;
}

// ===========================|| FINANCE - TRANSACTIONS CARD ||=========================== //

export default function TransactionCard({ title, color, amount, icon }: TransactionProps) {
  const getIcon = (iconName?: string) => {
    const iconSize = 48;
    const iconStyle = { 
      fontSize: iconSize, 
      color: color,
      opacity: 0.9
    };
    
    switch (iconName) {
      case 'wallet':
        return <AccountBalanceWallet sx={iconStyle} />;
      case 'account-balance':
        return <AccountBalance sx={iconStyle} />;
      case 'card-giftcard':
        return <CardGiftcard sx={iconStyle} />;
      case 'payment':
        return <Payment sx={iconStyle} />;
      default:
        return <AccountBalance sx={iconStyle} />;
    }
  };

  return (
    <MainCard 
      content={false} 
      sx={{ 
        p: 0,
        height: '100%',
        transition: 'all 0.2s ease',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          borderColor: color,
          boxShadow: `0 4px 20px ${color}20`
        }
      }}
    >
      <Stack sx={{ height: '100%', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight={500} 
            color="text.primary"
            sx={{ 
              fontSize: '0.95rem',
              lineHeight: 1.4
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Content */}
        <Stack sx={{ flex: 1, justifyContent: 'space-between' }}>
          {/* Icon */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 2
          }}>
            {getIcon(icon)}
          </Box>

          {/* Amount */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h5" 
              fontWeight={600} 
              color={color}
              sx={{ 
                fontSize: '1.75rem',
                lineHeight: 1.2
              }}
            >
              {amount}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </MainCard>
  );
}

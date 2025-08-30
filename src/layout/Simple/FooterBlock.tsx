// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// project-imports
import Logo from 'components/logo';

// assets
import { Mobile, Sms } from 'iconsax-react';

// link - custom style
const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateY(-2px)'
  }
}));

type showProps = {
  isFull?: boolean;
};

// ==============================|| LANDING - FOOTER PAGE ||============================== //

export default function FooterBlock({ isFull }: showProps) {
  return (
    <Box
      sx={{
        py: 4,
        background: (theme) => theme.palette.background.paper,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}10, ${theme.palette.background.paper})`,
          opacity: 0.5
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center">
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Logo />
          </Box>

          {/* Quick Links */}
          <Stack spacing={1}>
            <Typography variant="subtitle1" color="text.primary">
              Link nhanh
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 3 }} alignItems="center">
              <FooterLink href="#" underline="none">
                Liên hệ
              </FooterLink>
              <FooterLink href="#" underline="none">
                Bảng giá
              </FooterLink>
              <FooterLink href="#" underline="none">
                Tài liệu hướng dẫn
              </FooterLink>
            </Stack>
          </Stack>

          {/* Contact Info */}
          <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-end' }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                color: 'text.primary',
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateX(5px)',
                  color: 'primary.main'
                }
              }}
            >
              <Mobile variant="Bold" size={18} />
              <Typography variant="body2">0911.222.390</Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                color: 'text.primary',
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateX(5px)',
                  color: 'primary.main'
                }
              }}
            >
              <Sms variant="Bold" size={18} />
              <Typography variant="body2">khaosat.dev@gmail.com</Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* Copyright */}
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            &copy; 2025{' '}
            <Link href="https://khaosat.tech" target="_blank" underline="none">
              khaosat.tech
            </Link>
            . All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

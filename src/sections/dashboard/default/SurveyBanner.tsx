import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { ArrowRight, Flash } from 'iconsax-react';

// ==============================|| DASHBOARD - SURVEY BANNER ||============================== //

export default function SurveyBanner() {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <MainCard
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'primary.contrastText',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, ${alpha(theme.palette.background.paper, 0.1)} 25%, transparent 25%, transparent 75%, ${alpha(theme.palette.background.paper, 0.1)} 75%), linear-gradient(45deg, ${alpha(theme.palette.background.paper, 0.1)} 25%, transparent 25%, transparent 75%, ${alpha(theme.palette.background.paper, 0.1)} 75%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
          opacity: 0.3,
          zIndex: 1
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              {/* Badge */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.background.paper, 0.2),
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  width: 'fit-content',
                  border: `1px solid ${alpha(theme.palette.background.paper, 0.3)}`
                }}
              >
                <Flash size={16} style={{ marginRight: 8 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit' }}>
                  MIỄN PHÍ 50 FORM ĐẦU TIÊN
                </Typography>
              </Box>

              {/* Main Title */}
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  background: `linear-gradient(45deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Điền Form Siêu Nhanh
                <br />
                Dùng Thử Miễn Phí 50 Form!
              </Typography>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  color: alpha(theme.palette.background.paper, 0.9),
                  maxWidth: '600px',
                  lineHeight: 1.6
                }}
              >
                Bạn là sinh viên bận rộn hay cần chạy luận văn gấp? Khaosat.tech giúp bạn tự động điền khảo sát, bảng câu hỏi chỉ trong tích
                tắc! Tiết kiệm thời gian, tăng hiệu quả – thử ngay hôm nay!
              </Typography>
            </Stack>
          </Grid>

          {/* 3D Animated Illustration */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                position: 'relative',
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Main Form Icon with 3D effect */}
              <Box
                sx={{
                  position: 'relative',
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px) rotateY(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotateY(10deg)' }
                  }
                }}
              >
                {/* Form Background */}
                <Box
                  sx={{
                    width: 180,
                    height: 220,
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    borderRadius: 3,
                    position: 'relative',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    transform: 'perspective(1000px) rotateX(5deg) rotateY(-5deg)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -5,
                      left: -5,
                      right: -5,
                      bottom: -5,
                      background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
                      borderRadius: 3,
                      zIndex: -1,
                      opacity: 0.3
                    }
                  }}
                >
                  {/* Form Lines */}
                  {[...Array(8)].map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'absolute',
                        top: 40 + index * 20,
                        left: 20,
                        right: 20,
                        height: 3,
                        bgcolor: index % 3 === 0 ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.3),
                        borderRadius: 1,
                        animation: `fillLine 0.5s ease forwards ${index * 0.1}s`,
                        opacity: 0,
                        '@keyframes fillLine': {
                          to: { opacity: 1, transform: 'scaleX(1)' }
                        },
                        transform: 'scaleX(0)',
                        transformOrigin: 'left'
                      }}
                    />
                  ))}
                </Box>

                {/* Floating Icons */}
                {[...Array(3)].map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      width: 40,
                      height: 40,
                      bgcolor: theme.palette.background.paper,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      animation: `orbit${index + 1} 4s linear infinite`,
                      '@keyframes orbit1': {
                        '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' }
                      },
                      '@keyframes orbit2': {
                        '0%': { transform: 'rotate(120deg) translateX(100px) rotate(-120deg)' },
                        '100%': { transform: 'rotate(480deg) translateX(100px) rotate(-480deg)' }
                      },
                      '@keyframes orbit3': {
                        '0%': { transform: 'rotate(240deg) translateX(80px) rotate(-240deg)' },
                        '100%': { transform: 'rotate(600deg) translateX(80px) rotate(-600deg)' }
                      }
                    }}
                  >
                    <Flash size={20} color={theme.palette.primary.main} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
}

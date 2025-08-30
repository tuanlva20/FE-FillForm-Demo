import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// third-party
import { motion } from 'framer-motion';

// assets
import AnimateButton from 'components/@extended/AnimateButton';
import { Flash } from 'iconsax-react';

// ==============================|| LANDING - HERO PAGE ||============================== //

export default function HeroPage() {
  const theme = useTheme();

  // Animation variants for staggered text effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  // Floating animation for background elements
  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      x: [0, 10, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        pb: 12.5,
        pt: 10,
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.secondary[100]} 25%, 
          ${theme.palette.primary.lighter} 50%, 
          ${theme.palette.background.default} 75%, 
          ${theme.palette.secondary[200]} 100%)`,
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        overflow: 'hidden',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }}
    >
      {/* Floating background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {/* Animated geometric shapes */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary[400]}20)`,
            border: `2px solid ${theme.palette.primary.main}30`
          }}
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{
            position: 'absolute',
            top: '70%',
            right: '15%',
            width: '80px',
            height: '80px',
            borderRadius: '10px',
            background: `linear-gradient(45deg, ${theme.palette.warning.main}20, ${theme.palette.primary.dark}20)`,
            border: `2px solid ${theme.palette.warning.main}30`,
            animationDelay: '2s'
          }}
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{
            position: 'absolute',
            top: '30%',
            right: '5%',
            width: '60px',
            height: '60px',
            background: `linear-gradient(45deg, ${theme.palette.secondary[400]}20, ${theme.palette.primary.main}20)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            animationDelay: '4s'
          }}
        />
      </Box>

      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', pt: { md: 0, xs: 10 }, pb: { md: 0, xs: 22 } }}>
          <Grid size={{ xs: 12, md: 10 }}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid container spacing={3} sx={{ textAlign: 'center' }}>
                <Grid size={12}>
                  <motion.div variants={itemVariants}>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '1.825rem', sm: '2rem', md: '3.4375rem' },
                        fontWeight: 700,
                        lineHeight: 1.2,
                        mb: 2,
                        textShadow: `0 0 20px ${theme.palette.primary.main}30`
                      }}
                    >
                      KHÁM PHÁ CÔNG CỤ <br />
                      <Typography
                        variant="h1"
                        component="span"
                        sx={{
                          fontSize: 'inherit',
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary[400]}, ${theme.palette.warning.main}, ${theme.palette.primary.main}) 0 0 / 400% 100%`,
                          color: 'transparent',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          animation: 'move-bg 8s infinite linear, glow 2s ease-in-out infinite alternate',
                          '@keyframes move-bg': { '100%': { backgroundPosition: '400% 0' } },
                          '@keyframes glow': {
                            '0%': { textShadow: `0 0 5px ${theme.palette.primary.main}50` },
                            '100%': { textShadow: `0 0 20px ${theme.palette.primary.main}80, 0 0 30px ${theme.palette.warning.main}60` }
                          }
                        }}
                      >
                        KHẢO SÁT TỰ ĐỘNG
                      </Typography>{' '}
                      HÀNG ĐẦU
                    </Typography>
                  </motion.div>
                </Grid>

                <Grid size={12}>
                  <motion.div variants={itemVariants}>
                    <Typography
                      variant="h2"
                      sx={{
                        fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
                        fontWeight: 500,
                        lineHeight: 1.3,
                        mb: 3,
                        color: 'primary.main',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '100px',
                          height: '3px',
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.warning.main})`,
                          borderRadius: '2px'
                        }
                      }}
                    >
                      Giải pháp khảo sát thông minh cho nghiên cứu học thuật
                    </Typography>
                  </motion.div>
                </Grid>

                <Grid container size={12} sx={{ justifyContent: 'center' }}>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <motion.div variants={itemVariants}>
                      <Box
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.background.paper}80, ${theme.palette.secondary[100]}60)`,
                          backdropFilter: 'blur(10px)',
                          borderRadius: '16px',
                          padding: { xs: 3, md: 4 },
                          border: `1px solid ${theme.palette.primary.main}20`,
                          boxShadow: `0 8px 32px ${theme.palette.primary.main}10`,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}20, transparent)`,
                            animation: 'shine 3s infinite',
                            '@keyframes shine': {
                              '0%': { left: '-100%' },
                              '100%': { left: '100%' }
                            }
                          }
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: '0.95rem', md: '1.1rem' },
                            fontWeight: 400,
                            lineHeight: { xs: 1.6, md: 1.6 },
                            mb: 2
                          }}
                        >
                          <Box component="span" sx={{ fontWeight: 'bold' }}>
                            🤖 KHAOSAT.TECH
                          </Box>{' '}
                          giúp tự động điền form khảo sát{' '}
                          <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Bằng AI
                          </Box>
                          ,{' '}
                          <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Bảo Mật Cao
                          </Box>
                          ,{' '}
                          <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Tiết Kiệm Thời Gian
                          </Box>
                          .
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: '1.1rem', md: '1.1rem' },
                            fontWeight: 400,
                            lineHeight: { xs: 1.5, md: 1.6 },
                            color: 'text.secondary'
                          }}
                        >
                          📚 Phù hợp cho{' '}
                          <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Sinh Viên
                          </Box>
                          ,{' '}
                          <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Nghiên Cứu Sinh
                          </Box>
                          ,{' '}
                          <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Giảng Viên
                          </Box>{' '}
                          thực hiện:
                          <br />
                          🎓{' '}
                          <Box component="span" sx={{ fontWeight: 'bold' }}>
                            Khóa luận tốt nghiệp
                          </Box>
                          ,{' '}
                          <Box component="span" sx={{ fontWeight: 'bold' }}>
                            Luận văn Thạc sĩ – Tiến sĩ
                          </Box>
                          ,{' '}
                          <Box component="span" sx={{ fontWeight: 'bold' }}>
                            Nghiên cứu khoa học
                          </Box>
                          .
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                </Grid>

                <Grid size={12}>
                  <motion.div variants={itemVariants}>
                    <Grid container spacing={4} sx={{ justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                      <Grid
                        sx={{
                          position: 'relative',
                          textAlign: 'center',
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            height: 40,
                            bottom: '50%',
                            transform: 'translateY(50%)',
                            left: 'auto',
                            right: '-16px',
                            width: '1px',
                            bgcolor: 'divider'
                          }
                        }}
                      >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Typography variant="h4" sx={{ color: 'primary.main', fontSize: '1.4rem', lineHeight: 1.2 }}>
                            ⭐ 4.8/5
                            <Box
                              component="span"
                              sx={{ fontSize: '75%', fontWeight: 400, margin: 0.625, color: 'text.secondary', display: 'block' }}
                            >
                              đánh giá
                            </Box>
                          </Typography>
                        </motion.div>
                      </Grid>
                      <Grid sx={{ textAlign: 'center' }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Typography variant="h4" sx={{ fontSize: '1.4rem', lineHeight: 1.2 }}>
                            Hơn{' '}
                            <Box
                              component="span"
                              sx={{
                                color: 'primary.main',
                                fontWeight: 700,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary[400]})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                              }}
                            >
                              5.000+
                            </Box>
                            <Box
                              component="span"
                              sx={{ fontSize: '75%', fontWeight: 400, margin: 0.625, color: 'text.secondary', display: 'block' }}
                            >
                              khảo sát đã triển khai
                            </Box>
                          </Typography>
                        </motion.div>
                      </Grid>
                    </Grid>
                  </motion.div>
                </Grid>

                <Grid size={12}>
                  <motion.div variants={itemVariants}>
                    <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
                      <Grid>
                        <AnimateButton>
                          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              component={RouterLink}
                              to="/dashboard/default"
                              size="large"
                              variant="contained"
                              sx={{
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary[400]})`,
                                boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                                borderRadius: '12px',
                                padding: '12px 32px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                border: `1px solid ${theme.palette.primary.main}30`,
                                '&:hover': {
                                  background: `linear-gradient(45deg, ${theme.palette.primary.darker}, ${theme.palette.primary.main})`,
                                  boxShadow: `0 6px 25px ${theme.palette.primary.main}60`
                                }
                              }}
                            >
                              🚀 Khám Phá Công Cụ Ngay!
                            </Button>
                          </motion.div>
                        </AnimateButton>
                      </Grid>
                      <Grid>
                        <AnimateButton>
                          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              component={RouterLink}
                              to="/demo"
                              size="large"
                              variant="outlined"
                              startIcon={<Flash color="currentColor" />}
                              sx={{
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                borderRadius: '12px',
                                padding: '12px 32px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderWidth: '2px',
                                background: `${theme.palette.warning.main}05`,
                                '& .MuiButton-startIcon': {
                                  color: 'primary.main'
                                },
                                '&:hover': {
                                  color: 'primary.main',
                                  borderColor: 'primary.main',
                                  backgroundColor: `${theme.palette.warning.main}15`,
                                  boxShadow: `0 4px 20px ${theme.palette.warning.main}30`,
                                  borderWidth: '2px',
                                  '& .MuiButton-startIcon': {
                                    color: 'primary.main'
                                  }
                                }
                              }}
                            >
                              Xem Demo
                            </Button>
                          </motion.div>
                        </AnimateButton>
                      </Grid>
                    </Grid>
                  </motion.div>
                </Grid>
              </Grid>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

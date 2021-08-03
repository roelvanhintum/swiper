import { extend } from '../../../utils/utils';

export default function setBreakpoint() {
  const swiper = this;
  const { activeIndex, initialized, loopedSlides = 0, params, $el } = swiper;
  const breakpoints = params.breakpoints;
  if (!breakpoints || (breakpoints && Object.keys(breakpoints).length === 0)) return;

  // Get breakpoint for window width and update parameters
  const breakpoint = swiper.getBreakpoint(breakpoints, swiper.params.breakpointsBase, swiper.el);

  if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;

  const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : undefined;
  if (breakpointOnlyParams) {
    [
      'slidesPerView',
      'spaceBetween',
      'slidesPerGroup',
      'slidesPerGroupSkip',
      'slidesPerColumn',
    ].forEach((param) => {
      const paramValue = breakpointOnlyParams[param];
      if (typeof paramValue === 'undefined') return;
      if (param === 'slidesPerView' && (paramValue === 'AUTO' || paramValue === 'auto')) {
        breakpointOnlyParams[param] = 'auto';
      } else if (param === 'slidesPerView') {
        breakpointOnlyParams[param] = parseFloat(paramValue);
      } else {
        breakpointOnlyParams[param] = parseInt(paramValue, 10);
      }
    });
  }

  const breakpointParams = breakpointOnlyParams || swiper.originalParams;
  const wasMultiRow = params.slidesPerColumn > 1;
  const isMultiRow = breakpointParams.slidesPerColumn > 1;

  const wasEnabled = params.enabled;

  if (wasMultiRow && !isMultiRow) {
    $el.removeClass(
      `${params.containerModifierClass}multirow ${params.containerModifierClass}multirow-column`,
    );
    swiper.emitContainerClasses();
  } else if (!wasMultiRow && isMultiRow) {
    $el.addClass(`${params.containerModifierClass}multirow`);
    if (
      (breakpointParams.slidesPerColumnFill && breakpointParams.slidesPerColumnFill === 'column') ||
      (!breakpointParams.slidesPerColumnFill && params.slidesPerColumnFill === 'column')
    ) {
      $el.addClass(`${params.containerModifierClass}multirow-column`);
    }
    swiper.emitContainerClasses();
  }

  const directionChanged =
    breakpointParams.direction && breakpointParams.direction !== params.direction;
  const needsReLoop =
    params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);

  if (directionChanged && initialized) {
    swiper.changeDirection();
  }

  extend(swiper.params, breakpointParams);

  const isEnabled = swiper.params.enabled;

  extend(swiper, {
    allowTouchMove: swiper.params.allowTouchMove,
    allowSlideNext: swiper.params.allowSlideNext,
    allowSlidePrev: swiper.params.allowSlidePrev,
  });

  if (wasEnabled && !isEnabled) {
    swiper.disable();
  } else if (!wasEnabled && isEnabled) {
    swiper.enable();
  }

  swiper.currentBreakpoint = breakpoint;

  swiper.emit('_beforeBreakpoint', breakpointParams);

  if (needsReLoop && initialized) {
    swiper.loopDestroy();
    swiper.loopCreate();
    swiper.updateSlides();
    swiper.slideTo(activeIndex - loopedSlides + swiper.loopedSlides, 0, false);
  }

  swiper.emit('breakpoint', breakpointParams);
}

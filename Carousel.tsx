import {Text} from 'components/editable';
import {getModifiers} from 'components/libs';
import {EventEmitter} from 'components/events';
import {Theme} from 'components/types';
import React from 'react';
import './Carousel.scss';

import * as Types from 'components/types';

// @ts-ignore
import Flickity from './Flickity';

export type CarouselOptions = {
	cellSelector?: string;
	hash?: boolean;
	prevNextButtons?: boolean;
	pageDots?: boolean;
	imagesLoaded?: boolean;
	wrapAround?: boolean;
	resize?: boolean;
	watchCSS?: boolean;
	groupCells?: boolean;
	draggable?: boolean;
	cellAlign?: string;

	freeScroll?: boolean;
	autoPlay?: boolean | number;
	pauseAutoPlayOnHover?: boolean;
	fullscreen?: boolean;
	adaptiveHeight?: boolean;
	// TODO
	asNavFor?: any;
	dragThreshold?: number;
	selectedAttraction?: number;
	friction?: number;
	freeScrollFriction?: number;
	lazyLoad?: boolean;
	bgLazyLoad?: boolean;
	initialIndex?: number;
	accessibility?: boolean;
	setGallerySize?: boolean;
	contain?: boolean;
	percentPosition?: boolean;
	rightToLeft?: boolean;
	arrowShape?: string;
};

export type CarouselProps = {
	children: Types.Children;
	id: string;

	hasControlOverlap?: boolean;
	arrowStyle?: string;

	classes?: string;
	doFade?: boolean;
	fullwidth?: boolean;
	multiitem?: number;

	hasCustomControls?: boolean;
	doThemes?: boolean;

	isLazyLoad?: boolean;
	items?: Array<any>;
	itemsPerRow?: number;
	nextText?: string;
	noMobileCarousel?: boolean;

	theme?: Theme;

	options?: CarouselOptions;
	prevText?: string;
	onChange?: any; // function
};

type State = {
	dots?: number;
	currentSlide?: number;
};

export class Carousel extends React.Component<CarouselProps, State> {
	static defaultProps = {
		children: '',
		id: null,
		items: [],
		prevText: 'Prev',
		nextText: 'Next',
		hasCustomControls: true,
		options: {},
		doFade: false,
		fullwidth: false,
		multiitem: 0,
		arrowStyle: 'M20,50l50,50l10-10L40,50l40-40L70,0L20,50z',
		onChange: null,
		classes: '',
		isLazyLoad: false,
		itemsPerRow: 0,
	};

	base: string = 'carousel';
	state: State;
	options: CarouselOptions = {};
	custom: CarouselOptions = {};
	id: string;
	carouselItems: any;
	flkty: any;
	items: Array<any> = [];
	themes: Array<any> = [];
	cell: string;

	constructor(props: CarouselProps) {
		super(props);

		this.state = {
			dots: 0,
			currentSlide: 0,
		};

		const defaults = {
			hash: false,
			prevNextButtons: true,
			pageDots: true,
			imagesLoaded: true,
			wrapAround: true,
			resize: true,
			watchCSS: false,
		};

		this.cell = `${this.base}__cell`;

		const options: CarouselOptions = {...defaults, ...props.options};

		options.cellSelector = `.${this.cell}`;

		this.custom = {
			prevNextButtons: options.prevNextButtons,
			pageDots: options.pageDots,
		};

		if (props.hasCustomControls) {
			options.prevNextButtons = false;
			options.pageDots = false;
		}

		this.id = props.id;
		this.options = options;

		this.carouselItems = this.props.items && this.props.items.length ? this.props.items : this.props.children;
	}

	onClickPrev = () => {
		this.flkty.previous();
	};

	onClickNext = () => {
		this.flkty.next();
	};

	onGoToSlide = (index: number) => {
		if (this.flkty) {
			this.flkty.select(index);
		}
	};

	onResize = () => {
		const self = this;

		if (this.options.draggable) {
			setTimeout(() => {
				// if the slides length is 1 (nothing to slide) disable dragging
				if (self.flkty.slides && self.flkty.slides.length === 1) {
					self.flkty.unbindDrag();
				} else {
					self.flkty.bindDrag();
				}
			}, 2);
		}

		if (this.flkty.slides) {
			setTimeout(() => {
				self.setState({
					dots: this.flkty.slides.length,
				});
			}, 300);
		}
	};

	componentDidMount() {
		const {onChange, isLazyLoad, noMobileCarousel} = this.props;
		const self = this;

		if (this.carouselItems.length < 1 || noMobileCarousel || !this.id) {
			return false;
		}

		const flkty = new Flickity(`#${this.id}-carousel`, this.options);

		this.flkty = flkty;

		// bind events
		flkty.on('settle', () => {
			if (isLazyLoad && onChange) {
				onChange(flkty.selectedIndex, flkty.cells.length);
			}
		});

		flkty.on('select', () => {
			if (!isLazyLoad && onChange) {
				onChange(flkty.selectedIndex, flkty.cells.length);
			}
			this.setState(
				{
					currentSlide: this.flkty.selectedIndex,
				},
				() => {
					if (this.state.currentSlide !== undefined) {
						const container = document.querySelector(`#${self.id}`);

						if (container && container.previousSibling) {
							if (container.previousSibling.getAttribute('data-auto-theme')) {
								EventEmitter.dispatch('theme-change', self.themes[this.state.currentSlide]);
							}
						}
					}
				}
			);
		});

		if (typeof window === 'object') {
			window.addEventListener('resize', this.onResize);
		}

		if (flkty.slides) {
			this.setState({
				// adding because of potential hash navigation
				currentSlide: flkty.options.initialIndex || 0,
				dots: flkty.slides.length,
			});
		}

		this.onResize();
	}

	get current() {
		return this.state.currentSlide;
	}

	scrollTo(index: number) {
		this.onGoToSlide(index);
	}

	set selected(index: number) {
		this.scrollTo(index);
	}

	stopAutoPlay() {
		this.flkty.stopPlayer();
	}

	append(items: any) {
		const newitems = [];
		for (const item of items) {
			const slide = document.createElement('div');
			slide.className = this.cell;
			slide.innerHTML = `<div>${item}</div>`;
			newitems.push(slide);
		}

		this.flkty.append(newitems);
	}

	_destroyCarousel() {
		this.flkty.destroy();
	}

	disableDrag() {
		this.flkty.unbindDrag();
	}

	enableDrag() {
		this.flkty.bindDrag();
	}

	render() {
		const {
			prevText,
			nextText,
			doFade = false,
			fullwidth,
			multiitem = false,
			arrowStyle,
			classes,
			hasCustomControls,
			itemsPerRow = 0,
		} = this.props;

		const {hasControlOverlap = !multiitem || doFade} = this.props;

		const {doThemes = hasControlOverlap && !multiitem} = this.props;

		const {currentSlide = 0, dots = 0} = this.state;

		const self = this;

		this.items = [];
		this.themes = [];

		if (this.carouselItems) {
			const itemCount = this.carouselItems.length;
			const rowCount = Math.ceil(itemCount / itemsPerRow);

			this.items = React.Children.map(this.carouselItems, (item: any, i: number) => {
				const isLast = i >= (rowCount - 1) * itemsPerRow;
				const isLastClass = isLast ? 'last' : '';

				// TODO: check what type item is
				if (item.props && item.props.theme) {
					this.themes[i] = item.props.theme;
				}

				const id = item.props && item.props._id ? item.props._id : null;

				return (
					<div className={`${this.cell} ${isLastClass}`} key={i} id={id}>
						{item}
					</div>
				);
			});
		}

		if (this.items.length === 0) {
			return null;
		}

		const atts = {
			className: getModifiers(this.base, {
				fade: doFade,
				wide: fullwidth,
				multiple: multiitem && multiitem > 0,
				'overlap-controls': hasControlOverlap,
			}),
			'data-theme': doThemes ? this.themes[currentSlide] || undefined : undefined,
			id: this.id,
		};

		if (classes) {
			atts.className += ` ${classes}`;
		}

		const dots_ = [];

		if (dots > 1) {
			for (let i = 0; i < dots; i++) {
				const selected = this.state.currentSlide === i ? 'selected' : undefined;
				dots_.push(
					<li key={i} className={selected} onClick={() => this.onGoToSlide(i)}>
						{i + 1}
					</li>
				);
			}
		}

		return (
			<div {...atts}>
				<div className={`${this.base}__body`}>
					<div className={`${this.base}__main`}>
						<div id={`${this.id}-carousel`} className={`${this.base}__carousel`}>
							{this.items}
						</div>
					</div>
					{hasCustomControls &&
						this.id &&
						(this.custom.pageDots || this.custom.prevNextButtons) &&
						dots_.length > 0 && (
							<div className={`${self.base}__controls`}>
								{this.custom.prevNextButtons && (
									<button
										type="button"
										aria-label={prevText}
										className={`${self.base}__nav prev`}
										onClick={this.onClickPrev}
									>
										{arrowStyle && (
											<svg className={`${this.base}__arrow`} viewBox="0 0 100 100">
												<path d={arrowStyle} />
											</svg>
										)}

										<Text content={prevText} className={`${self.base}__label`} />
									</button>
								)}
								{this.custom.pageDots && dots_.length > 1 && (
									<ul className={`${this.base}__bullets`}>{dots_}</ul>
								)}
								{this.custom.prevNextButtons && (
									<button
										type="button"
										aria-label={nextText}
										className={`${self.base}__nav next`}
										onClick={this.onClickNext}
									>
										<Text content={nextText} className={`${self.base}__label`} />

										{arrowStyle && (
											<svg className={`${this.base}__arrow`} viewBox="0 0 100 100">
												<g transform="translate(100, 100) rotate(180)">
													<path d={arrowStyle} />
												</g>
											</svg>
										)}
									</button>
								)}
							</div>
						)}
				</div>
			</div>
		);
	}
}

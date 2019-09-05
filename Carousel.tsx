import * as React from 'react';

import './Carousel.scss';

import {getModifiers} from 'components/libs';
import {Theme} from 'components/types';

type CarouselProps = {
	children: React.ReactElement;
	theme?: Theme;
};

export const Carousel = (props: CarouselProps) => {
	const base: string = 'carousel';

	const {children, theme} = props;

	const atts: object = {
		className: getModifiers(base, {}),
		'data-theme': theme || 'default',
	};

	if (!children) {
		return null;
	}

	return (
		<div {...atts}>
			<div className={`${base}__main`}>
				{React.Children.map(children, (child: React.ReactElement) => (
					<div>{child}</div>
				))}
			</div>
		</div>
	);
};

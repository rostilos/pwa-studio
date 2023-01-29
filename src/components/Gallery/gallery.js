import React, { useMemo, useState } from 'react';
import { string, shape, array, func, number } from 'prop-types';
import { InView } from 'react-intersection-observer';

import { useStyle } from '@magento/venia-ui/lib/classify';
import GalleryItem from '@magento/venia-ui/lib/components/Gallery/item';
import GalleryItemShimmer from '@magento/venia-ui/lib/components/Gallery/item.shimmer';
import defaultClasses from '@magento/venia-ui/lib/components/Gallery/gallery.module.css';
import { useGallery } from '@magento/peregrine/lib/talons/Gallery/useGallery';

/**
 * Renders a Gallery of items. If items is an array of nulls Gallery will render
 * a placeholder item for each.
 *
 * @params {Array} props.items an array of items to render
 */
// в этом компоненте нужно добавить классы, на которые из useCategory хука будет срабатывать обсервер ( интерсекшн )
// и триггерить запрос на подгрузку новых товаров
const Gallery = props => {
    const { items, fetchCategoryDataMethod, currentPage, totalPages } = props;
    const classes = useStyle(defaultClasses, props.classes);
    const talonProps = useGallery();
    const { storeConfig } = talonProps;

    const [currentItemsList, setCurrentItemsList] = useState(currentPage);

    const loadNextItems = () => {
        if (currentItemsList < totalPages) {
            fetchCategoryDataMethod(currentItemsList + 1, true);
            setCurrentItemsList(currentItemsList + 1);
        }
    };

    const galleryItems = useMemo(
        () =>
            items.map((item, index) => {
                if (item === null) {
                    return <GalleryItemShimmer key={index} />;
                }
                return index + 1 === items.length ? (
                    <InView
                        as="div"
                        onChange={(inView, entry) =>
                            inView ? loadNextItems() : null
                        }
                        triggerOnce={true}
                    >
                        <GalleryItem
                            key={item.id}
                            item={item}
                            storeConfig={storeConfig}
                        />
                    </InView>
                ) : (
                    <GalleryItem
                        key={item.id}
                        item={item}
                        storeConfig={storeConfig}
                    />
                );
            }),
        [items, storeConfig]
    );

    return (
        <div>
            <div
                data-cy="Gallery-root"
                className={classes.root}
                aria-busy="false"
            >
                <div className={classes.items}>{galleryItems}</div>
            </div>
        </div>
    );
};

Gallery.propTypes = {
    classes: shape({
        filters: string,
        items: string,
        pagination: string,
        root: string,
        currentPage: number,
        totalPages: number,
        fetchCategoryData: func
    }),
    items: array.isRequired
};

export default Gallery;

import React, { useRef, useEffect } from 'react';
import md5 from '../scripts/md5.min';
import range from '../helpers/range';

const Identicon = (props: any) => {
    let {
        fg,
        bg,
        count,
        palette,
        string,
        size,
        getColor,
        padding,
        className
    } = props;

    const canvas = useRef(null);

    useEffect(() => {
        if (canvas != null) {
            updateCanvas();
        }
    });

    const updateCanvas = () => {
        const current = canvas.current as any;

        let hash = md5(string);
        let block = Math.floor(size / count);
        let hashcolor = hash.slice(0, 6);

        if (palette && palette.length) {
            let index = Math.floor(
                range(parseInt(hash.slice(-3), 16), 0, 4095, 0, palette.length)
            );
            fg = palette[index];
        }

        if (getColor) {
            getColor(fg || hashcolor);
        }

        let pad = padding;
        current.width = block * count + pad;
        current.height = block * count + pad;
        let arr = hash.split('').map(el => {
            const l = parseInt(el, 16);
            if (l < 8) {
                return 0;
            } else {
                return 1;
            }
        });

        let map = [];

        map[0] = map[4] = arr.slice(0, 5);
        map[1] = map[3] = arr.slice(5, 10);
        map[2] = arr.slice(10, 15);

        const ctx = current.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, current.width, current.height);

        map.forEach((row, i) => {
            row.forEach((el, j) => {
                if (el) {
                    ctx.fillStyle = fg ? fg : '#' + hashcolor;
                    ctx.fillRect(
                        block * i + pad,
                        block * j + pad,
                        block - pad,
                        block - pad
                    );
                } else {
                    ctx.fillStyle = bg;
                    ctx.fillRect(
                        block * i + pad,
                        block * j + pad,
                        block - pad,
                        block - pad
                    );
                }
            });
        });
    };

    return (
        <canvas
            ref={canvas}
            className={className}
            style={{ width: size, height: size }}
        />
    );
};

Identicon.defaultProps = {
    className: 'identicon',
    bg: 'transparent',
    count: 5,
    palette: null,
    fg: null,
    padding: 0,
    size: 400,
    getColor: null,
    string: ''
};

export default Identicon;
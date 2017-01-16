/// <reference types="jquery" />

import * as moment from 'moment';
export as namespace Kalendae;
export = Kalendae;

declare class Kalendae {
    static Input(targetElement: Element | string, options?: Kalendae.KalandaeOptions): Kalendae;

    constructor(targetElement: Element | string, options?: Kalendae.KalandaeOptions);
    constructor(options: Kalendae.KalandaeOptions);
    constructor();

    getSelected(): void;
    getSelectedAsText(format?: string): string[];
    getSelectedAsDates(): Date[];
    getSelectedRaw(): moment.Moment[];
    isSelected(date: Kalendae.KalendaeDate): boolean;
    setSelected(date: Kalendae.KalendaeDate | Kalendae.KalendaeDate[], draw?: boolean): void;
    addSelected(date: Kalendae.KalendaeDate, draw?: boolean): boolean;
    removeSelected(date: Kalendae.KalendaeDate, draw?: boolean): boolean;
    draw(): void;

    subscribe(topic: string, callback: Function, topPriority?: boolean): [ string, Function ];
    unsubscribe(handle: [ string, Function ]): void;
}


declare namespace Kalendae {
    export type KalendaeDate = string | Date | moment.Moment;

    export interface KalandaeOptions {
        attachTo?: Element | string;
        months?: number;
        weekStart?: number;
        direction?: 'any' | 'past' | 'today-past' | 'today-future' | 'future';
        directionScrolling?: boolean;
        viewStartDate?: string;
        blackout?: string[];
        selected?: KalendaeDate | (KalendaeDate)[];
        mode?: 'single' | 'multiple' | 'range';
        dayOutOfMonthClickable?: boolean;
        dayHeaderClickable?: boolean;
        format?: string;
        columnHeaderFormat?: string;
        titleFormat?: string;
        dayNumberFormat?: string;
        dayAttributeFormat?: string;
        parseSplitDelimiter?: RegExp;
        rangeDelimiter?: string;
        multipleDelimiter?: string;
        useYearNav?: boolean;
        side?: 'bottom' | 'left' | 'right' | 'top' | 'bottom right';
        dateClassMap?: { [date: string]: string; }
    }
}

interface JQuery {
    kalendae(options?: Kalendae.KalandaeOptions): JQuery;
    data(key: 'kalendae'): Kalendae;
}


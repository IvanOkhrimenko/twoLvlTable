import { Component } from '@angular/core';
import * as moment from 'moment';
import { TableDataService } from './table-data.service';

interface Element {
  id: number;
  name: string;
  leads: number;
  form_name: string;
  date: string;
  ravenue: number;
}

interface SortedElement {
  id: number;
  name: string;
  leads: number;
  form_name: string;
  date: string;
  ravenue: number;
  checked?: boolean;
  subitems?: Array<SortedElement>;
}

interface ColumnsConfig {
  groupedBy?: any;
  level: number;
  arrayData: ArrayDatum[];
}

interface ArrayDatum {
  name: string;
  key: string;
  countable: boolean;
  visible: boolean;
  showInSelect: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  columnsConfig: Array<ColumnsConfig> = [
    {
      groupedBy: null,
      level: 1,
      arrayData: [
        {
          name: 'id',
          key: 'id',
          countable: true,
          visible: false,
          showInSelect: false,
        },
        {
          name: 'Name',
          key: 'name',
          countable: false,
          visible: true,
          showInSelect: true,
        },
        {
          name: 'Ravenue',
          key: 'ravenue',
          countable: true,
          visible: true,
          showInSelect: true,
        },
        {
          name: 'Leads',
          key: 'leads',
          countable: true,
          visible: true,
          showInSelect: true,
        },
        {
          name: 'Date',
          key: 'date',
          countable: false,
          visible: false,
          showInSelect: false,
        },
        {
          name: 'RPL',
          key: 'rpl',
          countable: true,
          visible: true,
          showInSelect: false,
        },
      ],
    },
    {
      groupedBy: null,
      level: 2,
      arrayData: [
        {
          name: 'id',
          key: 'id',
          countable: true,
          visible: false,
          showInSelect: false,
        },
        {
          name: 'Name',
          key: 'name',
          countable: false,
          visible: true,
          showInSelect: false,
        },
        {
          name: 'Ravenue',
          key: 'ravenue',
          countable: true,
          visible: true,
          showInSelect: false,
        },
        {
          name: 'Leads',
          key: 'leads',
          countable: true,
          visible: true,
          showInSelect: false,
        },
        {
          name: 'Date',
          key: 'date',
          countable: false,
          visible: false,
          showInSelect: false,
        },
        {
          name: 'RPL',
          key: 'rpl',
          countable: true,
          visible: true,
          showInSelect: false,
        },
        {
          name: 'Form Name',
          key: 'form_name',
          countable: false,
          visible: false,
          showInSelect: true,
        },
      ],
    },
  ];

  startDate: moment.Moment;
  endDate: moment.Moment;
  dataSource: Array<Element>;
  sortedDataSource: Array<SortedElement>;

  constructor(private dataSourceService: TableDataService) {}

  ngOnInit() {
    this.dataSourceService.getAllData().subscribe(
      (data: any) => {
        this.dataSource = data.data;
        this.sortedDataSource = data.data;

        this.columnsConfig.find(
          (config) => config.level === 1
        ).groupedBy = name;
      },
      (err: any) => console.log(err)
    );
  }

  groupBy(name, level) {
    let index = this.columnsConfig
      .find((lvl) => lvl.level == level)
      .arrayData.findIndex((item) => item.key === name);

    this.changeColumnElementsOrder(level, index);

    if (level === 1) {
      this.sortedDataSource = Object.values(
        this.sortedDataSource.reduce(function (r, a) {
          r[a[name]] = r[a[name]] || [];
          r[a[name]].push(a);
          return r;
        }, Object.create(null))
      );

      this.sortedDataSource = this.setParentElement(
        this.sortedDataSource,
        level
      );
    } else {
      this.columnsConfig
        .find((lvl) => lvl.level == level)
        .arrayData.find(
          (key) =>
            key.key ===
            this.columnsConfig.find((lvl) => lvl.level == level - 1).groupedBy
        ).visible = false;

      this.columnsConfig.find(
        (lvl) => lvl.level == level
      ).arrayData[0].visible = true;

      this.sortedDataSource.forEach((parentElement) => {
        if (parentElement.subitems.length > 0) {
          return (parentElement.subitems = this.setParentElement(
            Object.values(
              parentElement.subitems.reduce(function (r, a) {
                r[a[name]] = r[a[name]] || [];
                r[a[name]].push(a);
                return r;
              }, Object.create(null))
            ),
            level
          ));
        }
      });
    }
  }

  changeColumnElementsOrder(level: number, index: number) {
    [
      this.columnsConfig.find((lvl) => lvl.level == level).arrayData[0],
      this.columnsConfig.find((lvl) => lvl.level == level).arrayData[index],
    ] = [
      this.columnsConfig.find((lvl) => lvl.level == level).arrayData[index],
      this.columnsConfig.find((lvl) => lvl.level == level).arrayData[0],
    ];
  }

  setParentElement(entryArray, level) {
    return entryArray.map((arrayOfElements) => {
      let parentElement = {};

      this.columnsConfig
        .find((lvl) => lvl.level == level)
        .arrayData.forEach((element) => {
          parentElement[element['key']] =
            arrayOfElements.length > 1
              ? arrayOfElements.reduce(
                  (a, b) =>
                    element.countable
                      ? a + (b[element.key] || 0)
                      : b[element.key],
                  0
                )
              : arrayOfElements.map((item) => item[element['key']])[0];
        });
      parentElement['rpl'] = (
        parentElement['ravenue'] / parentElement['leads']
      ).toFixed(2); //set rpl
      parentElement['checked'] = false;
      parentElement['subitems'] = [];

      if (arrayOfElements.length > 1) {
        arrayOfElements.forEach((element, index) => {
          element['rpl'] = (element['ravenue'] / element['leads']).toFixed(2); //set rpl
          element['checked'] = false;
          element['subitems'] = [];
          parentElement['subitems'].push(element);
        });
      }
      return parentElement;
    });
  }

  showSubItems(element) {
    element.checked = true;
  }

  changeDates(element) {
    this.startDate = moment(element.startDate, 'DD/MM/YYYY');
    this.endDate = moment(element.endDate, 'DD/MM/YYYY');
    this.compareDates();
  }

  compareDates() {
    return (this.sortedDataSource = this.dataSource.filter((element) =>
      moment(element.date).isBetween(this.startDate, this.endDate, 'days', '[]')
    ));
  }

  handleFirstChange(event, level) {
    if (this.startDate && this.endDate) {
      this.compareDates();
    }

    this.groupBy(event.target.value, level);
    this.columnsConfig.find((config) => config.level === level).groupedBy =
      event.target.value;
  }
}

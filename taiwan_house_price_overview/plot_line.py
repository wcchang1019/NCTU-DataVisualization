import json
import matplotlib.pyplot as plt
import os


def main():
    with open(f'3years_median_house_price_with_ratio.json', 'r', encoding='utf-8') as f:
        avg_price_json = json.load(f)
    for town, _ in avg_price_json['102'].items():
        for year in [3]:
            file_name = f'{year}years_median_house_price_with_ratio'
            if not os.path.exists(town):
                os.mkdir(town)
            with open(f'{file_name}.json', 'r', encoding='utf-8') as f:
                avg_price_json = json.load(f)
                tmp = dict()
                for y in range(102, 110):
                    for key, value in avg_price_json[str(y)][town].items():
                        if key in tmp:
                            if value == -999:
                                tmp[key].append(tmp[key][-1])
                            else:
                                tmp[key].append(value)
                        else:
                            tmp[key] = [value]
                print(tmp)
                plt.figure(figsize=(10, 10))
                for key, value in tmp.items():
                    plt.plot(value, label=key)
                plt.legend(bbox_to_anchor=(1.01, 1.), loc='upper left')
                plt.title(town)
                plt.tight_layout()
                plt.savefig(f'{town}_{year}.jpg')


if __name__ == '__main__':
    main()

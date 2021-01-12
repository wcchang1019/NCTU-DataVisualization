import pandas as pd
import numpy as np
import math
import string
import json
import datetime

REGION_CODE_DICT = {'a': '臺北市', 'b': '臺中市', 'c': '基隆市', 'd': '臺南市', 'e': '高雄市', 'f': '新北市', 'g': '宜蘭縣',
                    'h': '桃園市', 'i': '嘉義市', 'j': '新竹縣', 'k': '苗栗縣', 'm': '南投縣', 'n': '彰化縣', 'o': '新竹市',
                    'p': '雲林縣', 'q': '嘉義縣', 't': '屏東縣', 'u': '花蓮縣', 'v': '臺東縣', 'w': '金門縣', 'x': '澎湖縣',
                    'z': '連江縣'}
TOWNSHIP_DICT = {}
HOUSE_TYPE_LIST = list()
HOUSE_YEAR = 3
RECORD_THRESHOLD = 30
TOTAL_TOWN_RECORD = list()
RATIO = False


def get_data_by_region_code(region_code):
    df = pd.DataFrame()
    for y in range(102, 110):
        for s in range(1, 4):
            if y == 109 and s == 4:
                continue
            if df.empty:
                df = pd.read_csv(f'data/{y}S{s}/{region_code}_lvr_land_a.csv').iloc[1:, :]
            else:
                df = df.append(pd.read_csv(f'data/{y}S{s}/{region_code}_lvr_land_a.csv', encoding='utf-8').iloc[1:, :],
                               ignore_index=True)
    df = df[(df['交易標的'] == '房地(土地+建物)') | (df['交易標的'] == '房地(土地+建物)+車位')]
    df = df[[not math.isnan(x) for x in df['單價元平方公尺'].astype(float)]]
    df = df[[x > 0 for x in df['單價元平方公尺'].astype(float)]]
    global HOUSE_TYPE_LIST
    HOUSE_TYPE_LIST = np.unique(df['建物型態']).tolist()
    all_township = np.unique(df['鄉鎮市區']).tolist()
    TOWNSHIP_DICT[region_code] = all_township
    tmp = list()
    for x in df['建築完成年月']:
        try:
            tmp.append(datetime.datetime.strptime(str(int(x) + 19110000), '%Y%m%d'))
        except:
            tmp.append(datetime.datetime(1900, 1, 1))
    df['建築完成年月'] = tmp
    tmp2 = list()
    for x in df['交易年月日']:
        try:
            tmp2.append(datetime.datetime.strptime(str(int(x) + 19110000), '%Y%m%d'))
        except:
            tmp2.append(datetime.datetime(2070, 1, 1))
    df['交易年月日'] = tmp2
    # print('minus...')
    df = df[[y - x > datetime.timedelta(365*HOUSE_YEAR) for x, y in zip(tmp, tmp2)]]
    with open('region_code_dict.json', 'w', encoding='utf-8') as outfile:
        json.dump(REGION_CODE_DICT, outfile)
    with open('township_dict.json', 'w', encoding='utf-8') as outfile:
        json.dump(TOWNSHIP_DICT, outfile)
    return df


def dump_json_data():
    total_dict = {}
    price_base_line = {}
    for y in range(102, 110):
        print(f'preprocess...{y}')
        single_y_dict = {}
        for region_code in list(string.ascii_lowercase):
            single_region_dict = {}
            if region_code in ['l', 'r', 's', 'y']:
                continue
            df = get_data_by_region_code(region_code)
            # print('get data done!')
            y_data = df[[x.year == y+1911 for x in df['交易年月日']]]
            y_data = y_data[[not math.isnan(x) for x in y_data['單價元平方公尺'].astype(float)]]
            all_township = TOWNSHIP_DICT[region_code]
            if region_code == 'c':
                print(region_code)
            for township in all_township:
                try:
                    township_y_data = y_data[y_data['鄉鎮市區'] == township]
                    price = township_y_data['單價元平方公尺'].astype(int).median() / 0.3025
                    TOTAL_TOWN_RECORD.append(len(township_y_data))
                    if math.isnan(price) or len(township_y_data) < RECORD_THRESHOLD:
                        price = -999
                        single_region_dict[township] = price
                        for yy in range(y-1, 101, -1):
                            if total_dict[yy][township] != -999:
                                price = total_dict[yy][township]
                                single_region_dict[township] = price
                                break
                        continue
                    print(township, price)
                    if REGION_CODE_DICT[region_code]+township not in price_base_line or price_base_line[REGION_CODE_DICT[region_code]+township] == -999:
                        price_base_line[REGION_CODE_DICT[region_code]+township] = price
                    if RATIO:
                        single_region_dict[township] = (price - price_base_line[REGION_CODE_DICT[region_code]+township])/price_base_line[REGION_CODE_DICT[region_code]+township]*100 + 100
                    else:
                        single_region_dict[township] = price
                except KeyError:
                    print('key error')
                    single_region_dict[township] = -999
            try:
                price = y_data['單價元平方公尺'].astype(int).median() / 0.3025
                if math.isnan(price):
                    price = -999
                    for yy in range(y - 1, 101, -1):
                        if total_dict[yy][REGION_CODE_DICT[region_code]] != -999:
                            price = total_dict[yy][REGION_CODE_DICT[region_code]]
                            break
                if REGION_CODE_DICT[region_code] not in price_base_line or price_base_line[REGION_CODE_DICT[region_code]] == -999:
                    price_base_line[REGION_CODE_DICT[region_code]] = price
                if RATIO:
                    single_region_dict[REGION_CODE_DICT[region_code]] = (price - price_base_line[REGION_CODE_DICT[region_code]]) / price_base_line[REGION_CODE_DICT[region_code]]*100 + 100
                else:
                    single_region_dict[REGION_CODE_DICT[region_code]] = price
            except KeyError:
                single_region_dict[REGION_CODE_DICT[region_code]] = -999
            single_y_dict[REGION_CODE_DICT[region_code]] = single_region_dict
        total_dict[y] = single_y_dict
    if RATIO:
        file_name = f'{HOUSE_YEAR}years_median_house_price_with_ratio.json'
    else:
        file_name = f'{HOUSE_YEAR}years_median_house_price.json'
    with open(file_name, 'w', encoding='utf-8') as outfile:
        json.dump(total_dict, outfile)


def main():
    for x in range(0, 11):
        global HOUSE_YEAR
        HOUSE_YEAR = x
        dump_json_data()


if __name__ == '__main__':
    main()

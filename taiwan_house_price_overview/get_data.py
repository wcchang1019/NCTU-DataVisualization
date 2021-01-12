import requests
import zipfile


def download_url(url, save_path, chunk_size=128):
    r = requests.get(url, stream=True)
    with open(save_path, 'wb') as fd:
        for chunk in r.iter_content(chunk_size=chunk_size):
            fd.write(chunk)


def get_all_data():
    for year in range(101, 110):
        for q in range(1, 5):
            if year == 101 and q == 1:
                continue
            url = f'https://plvr.land.moi.gov.tw//DownloadSeason?season={year}S{q}&type=zip&fileName=lvr_landcsv.zip'
            print(url)
            download_url(url, f'data/{year}S{q}.zip')


def unzip_file():
    for year in range(101, 110):
        for q in range(1, 5):
            if year == 101 and q == 1:
                continue
            with zipfile.ZipFile(f'data/{year}S{q}.zip', 'r') as zip_ref:
                zip_ref.extractall(f'data/{year}S{q}')


if __name__ == '__main__':
    get_all_data()
    unzip_file()

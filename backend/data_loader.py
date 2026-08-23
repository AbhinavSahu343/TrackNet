import pandas as pd


def load_network_data(file_path):
    """
    Load network data from a CSV file.
    """

    data = pd.read_csv(file_path)

    return data.to_dict("records")
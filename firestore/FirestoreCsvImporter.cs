using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using Firebase.Firestore;
using UnityEditor;
using UnityEngine;

public class FirestoreCsvImporter
{
    [MenuItem("Firestore/CSVをFirestoreへ登録")]
    public static async void ImportCsv()
    {
        FirebaseFirestore db = FirebaseFirestore.DefaultInstance;

        string path = Path.Combine(Application.streamingAssetsPath, "excel-csv.csv");

        if (!File.Exists(path))
        {
            Debug.LogError($"CSVが見つかりません：{path}");
            return;
        }

        string[] lines = File.ReadAllLines(path);

        // 1行目はヘッダーなので飛ばす
        for (int i = 1; i < lines.Length; i++)
        {
            if (string.IsNullOrWhiteSpace(lines[i]))
                continue;

            string[] cols = lines[i].Split(',');

            if (cols.Length < 8)
            {
                Debug.LogWarning($"{i + 1}行目の列数が不足しています。");
                continue;
            }

            SpotData data = new SpotData
            {
                id = cols[0],
                title_name = cols[1],
                latitude = double.Parse(cols[2], CultureInfo.InvariantCulture),
                longitude = double.Parse(cols[3], CultureInfo.InvariantCulture),
                image_url = cols[4],
                spot_info1 = cols[5],
                spot_info2 = cols[6],
                title_url = cols[7]
            };

            GeoPoint point = new GeoPoint(data.latitude, data.longitude);

            Dictionary<string, object> firestoreData = new Dictionary<string, object>
            {
                { "title_name", data.title_name },
                { "coord", point },
                { "image_url", data.image_url },
                { "spot_name", data.spot_info1 },
                { "spot_info", data.spot_info2 },
                { "title_url", data.title_url }
            };

            try
            {
                await db.Collection("spot")
                        .Document(data.id)
                        .SetAsync(firestoreData);

                Debug.Log($"{data.id} 登録完了");
            }
            catch (Exception e)
            {
                Debug.LogError($"{data.id} の登録に失敗しました。\n{e}");
            }
        }

        Debug.Log("CSV登録完了");
    }
}

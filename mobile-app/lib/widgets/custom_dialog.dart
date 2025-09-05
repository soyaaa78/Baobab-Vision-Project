import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/widgets/custom_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

customDialog(BuildContext context, {required String title, required String content}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        backgroundColor: WHITE_COLOR,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        elevation: 8,
        titlePadding: EdgeInsets.fromLTRB(20.w, 20.h, 10.w, 0),
        contentPadding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 15.h),
        actionsPadding: EdgeInsets.only(bottom: 10.h, right: 15.w),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 22.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            IconButton(
              icon: Icon(Icons.close, color: Colors.black87),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
        content: Text(
          content,
          style: TextStyle(
            fontSize: 15.sp,
            color: Colors.grey[800],
            height: 1.5,
          ),
          textAlign: TextAlign.justify,
        ),
        actions: <Widget>[
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: BLACK_COLOR,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
              padding: EdgeInsets.symmetric(horizontal: 28.w, vertical: 12.h),
            ),
            child: Text(
              'Okay',
              style: TextStyle(
                color: WHITE_COLOR,
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      );
    },
  );
}

customShowImageDialog(BuildContext context, {required String imageUrl}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        backgroundColor: WHITE_COLOR,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        insetPadding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 24.h),
        contentPadding: EdgeInsets.zero,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Align(
              alignment: Alignment.topRight,
              child: IconButton(
                icon: Icon(Icons.close, color: Colors.black87),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
            ClipRRect(
              borderRadius: BorderRadius.circular(16.r),
              child: Container(
                height: 320.h,
                width: double.infinity,
                color: Colors.grey[200],
                child: Center(
                  child: imageUrl.startsWith('http')
                      ? CachedNetworkImage(
                          imageUrl: imageUrl,
                          fit: BoxFit.cover,
                          progressIndicatorBuilder: (context, url, downloadProgress) =>
                              CircularProgressIndicator(
                            color: BLACK_COLOR,
                            value: downloadProgress.progress,
                          ),
                          errorWidget: (context, url, error) => Icon(
                            Icons.broken_image,
                            size: 80.sp,
                            color: Colors.grey,
                          ),
                        )
                      : Image.asset(
                          imageUrl,
                          fit: BoxFit.cover,
                        ),
                ),
              ),
            ),
            SizedBox(height: 12.h),
          ],
        ),
      );
    },
  );
}

customOptionDialog(
  BuildContext context, {
  required String title,
  required String content,
  required Function onYes,
}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        backgroundColor: WHITE_COLOR,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        elevation: 8,
        titlePadding: EdgeInsets.fromLTRB(20.w, 20.h, 10.w, 0),
        contentPadding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 15.h),
        actionsPadding: EdgeInsets.only(bottom: 12.h, right: 15.w),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: CustomText(
                text: title,
                fontSize: 22.sp,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            IconButton(
              icon: Icon(Icons.close, color: Colors.black87),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
        content: CustomText(
          text: content,
          color: Colors.grey[800]!,
          fontSize: 15.sp,
          maxLines: 6,
        ),
        actions: <Widget>[
          OutlinedButton(
            onPressed: () => Navigator.of(context).pop(),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: Colors.grey.shade400),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
              padding: EdgeInsets.symmetric(horizontal: 22.w, vertical: 12.h),
            ),
            child: CustomText(
              text: 'No',
              color: Colors.black87,
              fontSize: 15.sp,
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              onYes();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: BLACK_COLOR,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
              padding: EdgeInsets.symmetric(horizontal: 28.w, vertical: 12.h),
            ),
            child: CustomText(
              text: 'Yes',
              color: WHITE_COLOR,
              fontSize: 15.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      );
    },
  );
}